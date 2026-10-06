import { NextRequest, NextResponse } from "next/server";
import { RETIRED_REDIRECTS, toPhysicalPath } from "@/lib/route-map";

// Replaces the /دعاء/... -> /dua/... mapping that used to live in
// next.config.ts's rewrites(). Confirmed empirically that rewrites()
// doesn't work here: its `source` pattern only matched requests carrying
// literal raw UTF-8 bytes in the request line, but real browsers/crawlers
// always percent-encode non-ASCII URLs before sending (e.g. "/%D8%AF...")
// — so it "worked" for a raw-byte curl test and would have silently 404'd
// for every real visitor. Decoding manually here and rewriting with
// NextResponse.rewrite() sidesteps whatever encoding assumption rewrites()
// makes internally.
//
// The prefix table and retired-page redirects live in lib/route-map.ts so the
// Cloudflare Worker (cloudflare/worker.ts), which replaces this file in
// production, applies exactly the same rules. This file only runs under
// `next dev` and on a plain (non-export) `next build`.

export function proxy(request: NextRequest) {
  // decodeURIComponent throws URIError on malformed percent-encoding (a
  // stray "%", an incomplete escape) — previously unguarded, so a crafted
  // request could throw an uncaught error out of the proxy instead of
  // falling through to Next's normal 404 handling. Not exploitable beyond
  // that (no state, nothing else reads this value), but worth closing.
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return;
  }

  for (const { from, to } of RETIRED_REDIRECTS) {
    if (decodedPathname === from) {
      const url = request.nextUrl.clone();
      url.pathname = to;
      return NextResponse.redirect(url, 308);
    }
  }

  const physical = toPhysicalPath(decodedPathname);
  if (physical !== null) {
    const url = request.nextUrl.clone();
    url.pathname = physical;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
