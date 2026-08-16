import { getAllDuaSlugs, getDua, slugifyPillar } from "@/lib/content";
import { getAllAdhkarSlugs, getAdhkarCollection } from "@/lib/adhkar";
import { getAllGuideSlugs, getGuide } from "@/lib/guides";

export interface SearchIndexItem {
  slug: string;
  title: string;
  href: string;
  quick_answer: string;
  /** Flattened keyword haystack for client-side substring matching. */
  keywords: string;
}

/**
 * One flat, lightweight list across all three content types for the
 * homepage search and (filtered client-side by localStorage slugs) the
 * bookmarks page — built once server-side from the same lib functions the
 * pages themselves already use, so there's no separate content pipeline to
 * keep in sync. Deliberately thin (no context_markdown/items/steps) since
 * this whole list ships to the client.
 *
 * Duas were sourced from getBuildableEntries() (content-plan.json phase
 * 1/2 entries) instead until this fix — same bug as lib/sitemap.ts and
 * generateStaticParams: 171 of 262 real dua files (65%) were invisible to
 * the site's own search box and the bookmarks-page index because they
 * were never in the tracked keyword plan to begin with.
 */
export function getSearchIndex(): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  for (const slug of getAllDuaSlugs()) {
    const dua = getDua(slug);
    if (!dua || !dua.index) continue;
    items.push({
      slug: dua.slug,
      title: dua.title,
      href: `/دعاء/${slugifyPillar(dua.pillar)}/${dua.slug}`,
      quick_answer: dua.quick_answer,
      keywords: [dua.title, dua.primary_keyword, ...dua.secondary_keywords].join(" "),
    });
  }

  for (const slug of getAllAdhkarSlugs()) {
    const collection = getAdhkarCollection(slug);
    if (!collection || !collection.index) continue;
    items.push({
      slug: collection.slug,
      title: collection.title,
      href: `/اذكار/${collection.slug}`,
      quick_answer: collection.quick_answer,
      keywords: collection.title,
    });
  }

  for (const slug of getAllGuideSlugs()) {
    const guide = getGuide(slug);
    if (!guide || !guide.index) continue;
    items.push({
      slug: guide.slug,
      title: guide.title,
      href: `/خطوات/${guide.slug}`,
      quick_answer: guide.quick_answer,
      keywords: guide.title,
    });
  }

  return items;
}
