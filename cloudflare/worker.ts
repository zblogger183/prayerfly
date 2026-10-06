// Front door for prayerfly.com on Cloudflare. The site itself is a static
// export served by Workers Static Assets (free, unmetered); this Worker only
// runs for the Arabic public URLs (see assets.run_worker_first in
// wrangler.jsonc) and does what proxy.ts does under `next dev`:
//
//   1. 308 retired duplicate pages to their replacement,
//   2. 308 a trailing slash away (Next's default, which the asset layer would
//      otherwise do against the ASCII path and leak it),
//   3. rewrite /دعاء/... to the ASCII physical route and serve that asset.
//
// Rules live in lib/route-map.ts, shared with proxy.ts.

import { RETIRED_REDIRECTS, ROUTE_PREFIXES, toPhysicalPath } from "../lib/route-map";

// Minimal local types: this file is bundled by Wrangler's esbuild (no type
// check) and excluded from the Next.js tsconfig, so we avoid pulling in
// @cloudflare/workers-types for three lines of surface.
type Fetcher = { fetch(request: Request): Promise<Response> };
interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = "prayerfly.com";

// Files that must answer 200 at their literal *.html URL. The asset layer's
// html_handling ("drop-trailing-slash") 307-redirects /x.html to /x, which
// Search Console's HTML-file verification does not accept; these are served
// from the extensionless asset path instead. Each needs a matching
// run_worker_first entry in the wrangler configs (checked by the build script).
const VERBATIM_HTML = new Set(["/google1ef7fd5451e318f1.html"]);

// Same set as cloudflare/_headers, which the asset layer applies to files it
// serves on its own. `_headers` is NOT applied to Worker-generated responses,
// so the rewritten pages need them set here (set() is idempotent if the asset
// layer already added them).
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
};

function redirect(to: URL): Response {
  return new Response(null, { status: 308, headers: { Location: to.toString() } });
}

// Per-segment encodeURIComponent: the same canonical form the asset layer
// uses (notably "$" -> "%24"). Passing it anything else makes it answer with a
// 307 to the canonical form, and the Next client's segment files contain "$"
// (…/__next.dua/$d$pillar/…), so a raw "$" would cost every prefetch a
// redirect — or loop, if a Location is rewritten back to the raw form.
function encodePath(decoded: string): string {
  return decoded.split("/").map(encodeURIComponent).join("/");
}

// Next's client requests per-segment RSC payloads by a flattened name
// (/x/__next.dua.$d$pillar.__PAGE__.txt) but a static export stores them in
// nested folders (/x/__next.dua/$d$pillar/__PAGE__.txt). Single-token files
// (__next._tree.txt, __next._index.txt, __next._full.txt) are stored as-is.
function unflattenSegmentFile(path: string): string {
  const slash = path.lastIndexOf("/");
  const match = /^__next\.([^.]+)\.(.+)\.txt$/.exec(path.slice(slash + 1));
  if (!match) return path;
  return `${path.slice(0, slash + 1)}__next.${match[1]}/${match[2].split(".").join("/")}.txt`;
}

// An asset-layer redirect (e.g. /x.html -> /x) is computed against the ASCII
// path we rewrote to; map it back so the ASCII route never reaches a client.
function restoreArabicLocation(response: Response, requestUrl: URL): Response {
  const location = response.headers.get("Location");
  if (!location) return response;
  const target = new URL(location, requestUrl);
  if (target.origin !== requestUrl.origin) return response;
  let decoded: string;
  try {
    decoded = decodeURIComponent(target.pathname);
  } catch {
    return response;
  }
  for (const { arabic, ascii } of ROUTE_PREFIXES) {
    const prefix = `/${ascii}`;
    if (decoded === prefix || decoded.startsWith(`${prefix}/`)) {
      target.pathname = encodePath(`/${arabic}${decoded.slice(prefix.length)}`);
      const fixed = new Response(response.body, response);
      fixed.headers.set("Location", target.toString());
      return fixed;
    }
  }
  return response;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    let decodedPathname: string;
    try {
      decodedPathname = decodeURIComponent(url.pathname);
    } catch {
      // Malformed percent-encoding: let the asset layer answer (404).
      return env.ASSETS.fetch(request);
    }

    for (const { from, to } of RETIRED_REDIRECTS) {
      if (decodedPathname === from) {
        const target = new URL(url);
        target.pathname = encodePath(to);
        return redirect(target);
      }
    }

    const physical = toPhysicalPath(decodedPathname);
    let response: Response;

    if (VERBATIM_HTML.has(decodedPathname)) {
      const target = new URL(url);
      target.pathname = decodedPathname.slice(0, -".html".length);
      response = await env.ASSETS.fetch(new Request(target, request));
    } else if (physical === null) {
      response = await env.ASSETS.fetch(request);
    } else if (decodedPathname.length > 1 && decodedPathname.endsWith("/")) {
      const target = new URL(url);
      target.pathname = encodePath(decodedPathname.replace(/\/+$/, ""));
      return redirect(target);
    } else {
      const target = new URL(url);
      target.pathname = encodePath(unflattenSegmentFile(physical));
      response = restoreArabicLocation(
        await env.ASSETS.fetch(new Request(target, request)),
        url,
      );
    }

    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
    // Any hostname other than the canonical one (staging *.workers.dev, a
    // stray preview URL) must never be indexable, whatever the page's own
    // robots meta says.
    if (url.hostname !== CANONICAL_HOST) headers.set("X-Robots-Tag", "noindex, nofollow");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
