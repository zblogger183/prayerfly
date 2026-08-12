import { getAllPillarHubs, getBuildableEntries, getDua, slugifyPillar } from "@/lib/content";
import { getAllAdhkarSlugs, getAdhkarCollection } from "@/lib/adhkar";
import { getAllGuideSlugs, getGuide } from "@/lib/guides";

const SITE_URL = "https://prayerfly.com";

export interface SitemapEntry {
  url: string;
  lastModified: string;
}

/**
 * All indexable URLs across every content type — Phase 1 + Phase 2 duas
 * (`getBuildableEntries` already gates on phase/file existence; each entry
 * is re-checked against its own `index` field here, since a real file can
 * still be individually noindexed), pillar hubs, adhkar collections, guides,
 * and the static trust pages.
 *
 * Currently returned as one flat array from `app/sitemap.ts` — at ~30 URLs
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

  for (const planEntry of getBuildableEntries()) {
    const dua = getDua(planEntry.slug);
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
