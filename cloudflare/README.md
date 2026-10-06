# Hosting on Cloudflare

prayerfly.com is a **static export** (`out/`) served by Cloudflare Workers
Static Assets, plus a small Worker (`worker.ts`) that does what `proxy.ts` does
under `next dev`. Nothing runs on a server per request: every page is
prerendered from `content/*.json`, so a content change means a rebuild and a
deploy (there is no ISR on this target).

Why not OpenNext/vinext: `proxy.ts` is a Node-runtime proxy in Next 16, which
the OpenNext adapter does not support, and the content is fully static anyway.

## Files

| File | Purpose |
| --- | --- |
| `scripts/build-cloudflare.mjs` | Runs `next build` with `DEPLOY_TARGET=cloudflare` (turns on `output: "export"` in `next.config.ts`), prunes `out/`, copies `_headers`, and fails the build on any indexing/routing mistake |
| `worker.ts` | Arabic URL -> ASCII route rewrite, retired-page 308s, trailing-slash 308, segment-payload name mapping, security headers |
| `_headers` | Security + cache headers for files the asset layer serves directly (copied to `out/_headers`) |
| `../wrangler.jsonc` | **Production**: custom domain `prayerfly.com`, no workers.dev, no preview URLs |
| `wrangler.staging.jsonc` | Staging on `*.workers.dev`, built **noindex** |
| `wrangler.www.jsonc` | Tiny Worker: `www.prayerfly.com` -> apex (308) |
| `../lib/route-map.ts` | Arabic<->ASCII prefix table and retired redirects, shared with `proxy.ts` |

## Commands

```bash
npm run build:cloudflare            # production build -> out/ (indexable)
npm run build:cloudflare:staging    # noindex build
npm run deploy:staging              # staging build + deploy to *.workers.dev
npx wrangler deploy                 # deploy production (after build:cloudflare)
npx wrangler deploy -c cloudflare/wrangler.www.jsonc
```

Local check without an account: build, then `npm run preview:cloudflare`
(serves `out/` through the real Worker on http://127.0.0.1:8787).

## Rules to keep it working

- **New Arabic route prefix** -> add it to `lib/route-map.ts` *and* both
  wrangler configs' `run_worker_first` (percent-encoded, with and without
  `/*`). The build fails if one is missing.
- **Security headers** exist twice: `next.config.ts` `headers()` (Vercel/dev)
  and `_headers` + `SECURITY_HEADERS` in `worker.ts` (Cloudflare). Change all.
- `NEXT_PUBLIC_ALLOW_INDEXING` is set by the build script (production `true`,
  `--staging` `false`); `.env*` is gitignored so it cannot live there.
- The Search Console file is served by the Worker (`VERBATIM_HTML`) because the
  asset layer would otherwise 307 `/google….html` to the extensionless URL.
- Zone setting: turn **Email Address Obfuscation off** (Scrape Shield). The
  site prints `contact@` / `corrections@` addresses, and obfuscation rewrites
  the HTML, which breaks `mailto:` links and React hydration. Turn
  **Always Use HTTPS on**, since static assets are served without the Worker.
