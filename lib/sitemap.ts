import { getAllDuaSlugs, getAllPillarHubs, getDua, slugifyPillar } from "@/lib/content";
import { getAllAdhkarSlugs, getAdhkarCollection } from "@/lib/adhkar";
import { getAllGuideSlugs, getGuide } from "@/lib/guides";

const SITE_URL = "https://prayerfly.com";

export interface SitemapEntry {
  url: string;
  lastModified: string;
}

/**
 * All indexable URLs across every content type — every real dua file
 * (`getAllDuaSlugs()` scans content/duas/ directly; each is individually
 * gated on its own `index` field, since a real file can still be
 * noindexed), pillar hubs, adhkar collections, guides, and the static
 * trust pages.
 *
 * Was built from `getBuildableEntries()` (content-plan.json phase 1/2
 * entries) instead — silently omitted every dua added outside the
 * tracked keyword plan, which turned out to be 171 of 262 real dua pages
 * (65% of the collection) once "known-topic search" became the primary
 * way new duas were found. A sitemap that lists a third of the real
 * content isn't a rounding error, it's most of the site being invisible
 * to search-engine discovery.
 *
 * Currently returned as one flat array from `app/sitemap.ts` — at ~300 URLs
 * we're nowhere near Google's 50,000-per-file limit. Kept as a single
 * function (rather than inlined in app/sitemap.ts) so that switching to
 * Next's `generateSitemaps` chunking later is a matter of `chunk(getSitemapEntries(), 45_000)`
 * around this same list, not a rewrite of how the URLs are gathered.
 */
export function getSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString();

  entries.push({ url: `${SITE_URL}/`, lastModified: today });
  entries.push({ url: `${SITE_URL}/عن-الموقع`, lastModified: today });
  entries.push({ url: `${SITE_URL}/سياسة-الخصوصية`, lastModified: today });
  entries.push({ url: `${SITE_URL}/اتصل-بنا`, lastModified: today });

  for (const hub of getAllPillarHubs()) {
    entries.push({ url: `${SITE_URL}/دعاء/${hub.pillarSlug}`, lastModified: today });
  }

  for (const slug of getAllDuaSlugs()) {
    const dua = getDua(slug);
    if (!dua || !dua.index) continue;
    entries.push({
      url: `${SITE_URL}/دعاء/${slugifyPillar(dua.pillar)}/${dua.slug}`,
      lastModified: dua.last_updated,
    });
  }

  for (const slug of getAllAdhkarSlugs()) {
    const collection = getAdhkarCollection(slug);
    if (!collection || !collection.index) continue;
    entries.push({
      url: `${SITE_URL}/اذكار/${collection.slug}`,
      lastModified: collection.last_updated,
    });
  }

  for (const slug of getAllGuideSlugs()) {
    const guide = getGuide(slug);
    if (!guide || !guide.index) continue;
    entries.push({
      url: `${SITE_URL}/خطوات/${guide.slug}`,
      lastModified: guide.last_updated,
    });
  }

  return entries;
}
