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
};

export default nextConfig;
