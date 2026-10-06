// Single source of truth for the Arabic public URL -> ASCII physical route
// mapping. Consumed by proxy.ts (next dev / Vercel) and by
// cloudflare/worker.ts (production on Cloudflare). Keep this file free of
// Next.js imports: the Worker bundles it with esbuild, not Next.
//
// Next.js 16.3's static export rejects non-ASCII *static* route folders, so
// routes live under ASCII folders (app/dua/...) and the real "/دعاء/..." URL
// is restored by a rewrite. See next.config.ts for the history.

// One entry per top-level Arabic route from PROJECT_PLAN.md Section 4.1. Add
// to this list rather than writing a new regex per route.
export const ROUTE_PREFIXES: { arabic: string; ascii: string }[] = [
  { arabic: "دعاء", ascii: "dua" },
  { arabic: "اذكار", ascii: "azkar" },
  { arabic: "خطوات", ascii: "guides" },
  { arabic: "عن-الموقع", ascii: "about" },
  { arabic: "سياسة-الخصوصية", ascii: "privacy" },
  { arabic: "اتصل-بنا", ascii: "contact" },
  { arabic: "ادوات", ascii: "tools" },
  { arabic: "محفوظاتي", ascii: "bookmarks" },
];

// Pages retired as duplicate content (merged into another page rather than
// deleted outright — a stale bookmark, inbound link, or cached SERP entry
// should land somewhere real, not 404). Checked before the ROUTE_PREFIXES
// rewrite so these 308 straight to the replacement instead of ever reaching
// the (now-deleted) content file. Paths are decoded (real Arabic, not
// percent-encoded) and compared for exact equality.
export const RETIRED_REDIRECTS: { from: string; to: string }[] = [
  {
    // Same hadith as دعاء-خروج-المنزل (identical text, same narrator —
    // Anas ibn Malik), published as two separate pages; kept the one
    // citing the primary source (Sunan Abi Dawud) over the one citing a
    // compiled index (Sahih al-Jami).
    from: "/دعاء/المنزل-والخروج/دعاء-الخروج-من-المنزل",
    to: "/دعاء/المنزل-والخروج/دعاء-خروج-المنزل",
  },
];

/**
 * Maps a decoded request pathname to its ASCII physical route, or null when
 * the path isn't under an Arabic public prefix. Handles any depth so metadata
 * routes (/دعاء/[pillar]/[slug]/opengraph-image) and RSC payload files
 * (…/slug.txt, …/__next.*.txt) rewrite along with the page.
 */
export function toPhysicalPath(decodedPathname: string): string | null {
  for (const { arabic, ascii } of ROUTE_PREFIXES) {
    const prefix = `/${arabic}`;
    if (decodedPathname === prefix) return `/${ascii}`;
    if (decodedPathname.startsWith(`${prefix}/`)) {
      return `/${ascii}${decodedPathname.slice(prefix.length)}`;
    }
  }
  return null;
}
