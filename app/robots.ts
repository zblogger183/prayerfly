import type { MetadataRoute } from "next";

// Indexing safety net (PROJECT_PLAN.md Sprint 12a/12b): defaults to
// blocked so a forgotten env var fails closed, not open. Flip
// NEXT_PUBLIC_ALLOW_INDEXING=true once prayerfly.com is the domain
// crawlers actually reach — see app/layout.tsx for the matching global
// noindex meta tag gated on the same var.
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(allowIndexing ? { allow: "/" } : { disallow: "/" }),
    },
    // Left pointing at the production sitemap even while blocked — this
    // is correct for later and Disallow: / already stops crawling now.
    sitemap: "https://prayerfly.com/sitemap.xml",
  };
}
