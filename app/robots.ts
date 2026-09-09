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
      ...(allowIndexing
        ? {
            allow: "/",
            // Internal ASCII "shadow" routes (see proxy.ts) — every real
            // page is only ever linked at its Arabic public URL and
            // self-canonicalizes back to it (confirmed: /dua/..., /about,
            // /privacy, /contact, /tools/..., /bookmarks all 200 with a
            // canonical pointing at the Arabic path). These ASCII paths
            // exist purely because Next's static export rejects non-ASCII
            // route *folder* names, not for any crawler to visit — blocking
            // them outright is pure crawl-budget hygiene, not a duplicate
            // content fix (canonical already handles that).
            disallow: ["/dua/", "/azkar/", "/guides/", "/tools/", "/about", "/privacy", "/contact", "/bookmarks"],
          }
        : { disallow: "/" }),
    },
    // Left pointing at the production sitemap even while blocked — this
    // is correct for later and Disallow: / already stops crawling now.
    sitemap: "https://prayerfly.com/sitemap.xml",
  };
}
