import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output` override: stays on the default server target so SSG pages can
  // still use ISR (`export const revalidate = ...`) later, per Sprint 4.
  // images.remotePatterns intentionally left unset — no external audio/image
  // host has been chosen yet; add entries here once one is.

  // Next.js 16.3's static export throws InvalidCharacterError for any
  // non-ASCII *static* route segment (confirmed via isolated repro during
  // Sprint 4 — dynamic param values in Arabic work fine; a folder named
  // "دعاء" in the route path does not, even with zero dynamic segments
  // involved). The dua/pillar-hub routes physically live under the ASCII
  // app/dua/... path; proxy.ts restores the real "/دعاء/..." public URL
  // PROJECT_PLAN.md's Section 4.1 specifies. That mapping lives in
  // proxy.ts rather than here — declarative rewrites() only matched
  // requests carrying literal raw UTF-8 bytes, not the percent-encoded
  // form every real browser/crawler actually sends for non-ASCII URLs.

  // Baseline security headers ahead of launch. Deliberately NOT including
  // Content-Security-Policy here: this site has no external scripts yet,
  // but Sprint 13 (AdSense) will need specific script/frame/img origins
  // (googlesyndication.com, googlesyndication.com, doubleclick.net, etc.)
  // — writing a CSP now without knowing AdSense's exact requirements would
  // either be too loose to matter or break ad loading later. Add it once
  // those origins are known, not guessed today.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // includeSubDomains but not `preload`: preload-list submission is
          // effectively permanent (very slow to reverse across browsers),
          // and this domain's subdomain plans aren't settled yet — safe to
          // add later, not something to commit to by default now.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
