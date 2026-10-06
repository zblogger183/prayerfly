// Builds the static export that Cloudflare serves (see cloudflare/ and
// wrangler.jsonc):  node scripts/build-cloudflare.mjs [--staging]
//
//   production (default)  NEXT_PUBLIC_ALLOW_INDEXING=true
//   --staging             NEXT_PUBLIC_ALLOW_INDEXING=false  (noindex everywhere)
//
// NEXT_PUBLIC_* values are inlined at build time, and .env* files are
// gitignored, so the flag is set here rather than hoping a dashboard variable
// is present. An explicit NEXT_PUBLIC_ALLOW_INDEXING in the environment wins,
// but the post-build checks below fail the build if the result contradicts
// the mode (an indexable staging copy, or a noindex production site).
//
// Plain ESM with no TypeScript imports, so it runs on any Node CI image.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

// Arabic prefixes straight from lib/route-map.ts's source text (importing the
// .ts file would need a Node with type stripping).
const ROUTE_PREFIXES = [...readFileSync(join(root, "lib", "route-map.ts"), "utf8").matchAll(/arabic:\s*"([^"]+)"/g)].map(
  (m) => ({ arabic: m[1] }),
);
if (ROUTE_PREFIXES.length === 0) throw new Error("could not read ROUTE_PREFIXES from lib/route-map.ts");
const out = join(root, "out");
const staging = process.argv.includes("--staging");
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING ?? (staging ? "false" : "true");

function fail(message) {
  console.error(`\n[build-cloudflare] FAILED: ${message}\n`);
  process.exit(1);
}

// Guard: wrangler.jsonc's run_worker_first must cover every Arabic prefix, or
// that section would silently 404 (the asset layer has no such file).
for (const file of ["wrangler.jsonc", "cloudflare/wrangler.staging.jsonc"]) {
  const config = readFileSync(join(root, file), "utf8");
  for (const { arabic } of ROUTE_PREFIXES) {
    const encoded = encodeURI(`/${arabic}`);
    if (!config.includes(`"${encoded}"`) || !config.includes(`"${encoded}/*"`)) {
      fail(`${file} run_worker_first is missing ${encoded} (${arabic}); update it to match lib/route-map.ts`);
    }
  }
}

// The Search Console verification file is served by the Worker (see
// VERBATIM_HTML in cloudflare/worker.ts), so it must be routed to it too.
for (const file of ["wrangler.jsonc", "cloudflare/wrangler.staging.jsonc"]) {
  if (!readFileSync(join(root, file), "utf8").includes('"/google1ef7fd5451e318f1.html"')) {
    fail(`${file} run_worker_first is missing /google1ef7fd5451e318f1.html`);
  }
}

console.log(`[build-cloudflare] mode=${staging ? "staging" : "production"} NEXT_PUBLIC_ALLOW_INDEXING=${allowIndexing}`);
rmSync(out, { recursive: true, force: true });

const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const build = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    DEPLOY_TARGET: "cloudflare",
    NEXT_PUBLIC_ALLOW_INDEXING: allowIndexing,
  },
});
if (build.status !== 0) fail("next build exited non-zero");
if (!existsSync(join(out, "index.html"))) fail("out/index.html missing after build");

// /dev/components is a dev-only page that calls notFound() in production; as
// a static export it would ship as a 200 error shell. _not-found is Next's
// internal copy of 404.html.
for (const path of ["dev", "_not-found", "_not-found.html", "_not-found.txt"]) {
  rmSync(join(out, path), { recursive: true, force: true });
}

cpSync(join(root, "cloudflare", "_headers"), join(out, "_headers"));

// ---- sanity checks ----------------------------------------------------
const home = readFileSync(join(out, "index.html"), "utf8");
const robots = readFileSync(join(out, "robots.txt"), "utf8");
const homeNoindex = /<meta name="robots" content="noindex/.test(home);
const robotsBlocksAll = /^Disallow:\s*\/\s*$/m.test(robots);

if (staging) {
  if (!homeNoindex || !robotsBlocksAll) {
    fail("staging build is indexable (expected noindex meta and robots Disallow: /)");
  }
} else {
  if (homeNoindex || robotsBlocksAll) {
    fail("production build is NOT indexable — check NEXT_PUBLIC_ALLOW_INDEXING");
  }
  if (!/Sitemap:\s*https:\/\/prayerfly\.com\/sitemap\.xml/.test(robots)) {
    fail("production robots.txt does not point at https://prayerfly.com/sitemap.xml");
  }
}
if (!existsSync(join(out, "404.html"))) fail("out/404.html missing (not_found_handling needs it)");
if (!existsSync(join(out, "google1ef7fd5451e318f1.html"))) fail("Search Console verification file missing from out/");

let files = 0;
let bytes = 0;
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      files++;
      bytes += statSync(full).size;
    }
  }
})(out);
if (files > 20000) fail(`${files} files exceeds the Workers Free static-asset limit (20,000)`);

console.log(`[build-cloudflare] OK: ${files} files, ${(bytes / 1024 / 1024).toFixed(0)} MiB in out/`);
