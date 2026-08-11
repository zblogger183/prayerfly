import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output` override: stays on the default server target so SSG pages can
  // still use ISR (`export const revalidate = ...`) later, per Sprint 4.
  // images.remotePatterns intentionally left unset — no external audio/image
  // host has been chosen yet; add entries here once one is.
};

export default nextConfig;
