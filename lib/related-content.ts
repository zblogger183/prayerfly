import { getAllDuaSlugs, getDua, slugifyPillar } from "@/lib/content";
import { getAdhkarCollection } from "@/lib/adhkar";
import { getGuide } from "@/lib/guides";
import type { RelatedDua } from "@/components/RelatedDuas";

let pillarIndexCache: Map<string, RelatedDua[]> | null = null;

/**
 * Every indexable dua grouped by pillar, each group sorted by slug so the
 * ring order in getSiblingDuas() is stable across builds. Memoized in
 * production only — dev must keep re-reading content/duas/ so a JSON edit
 * shows up without restarting the server.
 */
function getPillarIndex(): Map<string, RelatedDua[]> {
  if (pillarIndexCache) return pillarIndexCache;

  const index = new Map<string, RelatedDua[]>();
  for (const slug of getAllDuaSlugs()) {
    const dua = getDua(slug);
    if (!dua || !dua.index) continue;
    const key = slugifyPillar(dua.pillar);
    const group = index.get(key) ?? [];
    group.push({ title: dua.title, slug: dua.slug, pillar: key });
    index.set(key, group);
  }
  for (const group of index.values()) {
    group.sort((a, b) => a.slug.localeCompare(b.slug, "ar"));
  }

  if (process.env.NODE_ENV === "production") pillarIndexCache = index;
  return index;
}

/**
 * The next `limit` duas after `current` in its pillar, walking the slug-
 * sorted list as a ring. Handpicked `related_slugs` only exist on a
 * minority of pages, so most duas had one or two internal links in and
 * out; a ring gives every page in a pillar the same number of inbound
 * sibling links (rather than piling them onto whichever slugs sort
 * first) without any per-page curation. `exclude` drops anything the page
 * already links to via related_slugs.
 */
export function getSiblingDuas(
  current: { slug: string; pillar: string },
  exclude: RelatedDua[] = [],
  limit = 6
): RelatedDua[] {
  const siblings = getPillarIndex().get(slugifyPillar(current.pillar)) ?? [];
  const at = siblings.findIndex((s) => s.slug === current.slug);
  const skip = new Set([current.slug, ...exclude.map((e) => e.slug)]);

  const picked: RelatedDua[] = [];
  for (let step = 1; step <= siblings.length && picked.length < limit; step++) {
    const candidate = siblings[(at + step) % siblings.length];
    if (!skip.has(candidate.slug)) picked.push(candidate);
  }
  return picked;
}

/**
 * Resolves `related_slugs` (plain slug strings, no type tag) against every
 * content type in turn — dua first (the overwhelming majority of links),
 * then guide, then adhkar collection — since a slug alone doesn't say which
 * directory it lives in. A slug that resolves in more than one directory
 * can't happen in practice (dedupe-clusters.ts keeps dua/guide/adhkar slugs
 * disjoint), so first-match is unambiguous.
 *
 * Split out of lib/content.ts (which only knew about content/duas/) because
 * a real cross-link was silently dropping: content/duas/ادعيه-العمره.json
 * and content/guides/خطوات-الحج.json both list "خطوات-العمرة" in
 * related_slugs, but getDua() can never resolve a guide slug, so the link
 * just vanished instead of rendering. Lives in its own module rather than
 * lib/content.ts itself to avoid a circular import — lib/guides.ts and
 * lib/adhkar.ts both already import decodeSlug from lib/content.ts.
 *
 * Anything that resolves nowhere (a stale/typo'd entry) is silently
 * dropped rather than 404ing or crashing the page it's linked from — same
 * behavior as before this split.
 */
export function getRelatedDuas({ related_slugs }: { related_slugs: string[] }): RelatedDua[] {
  const related: RelatedDua[] = [];
  for (const slug of related_slugs) {
    const dua = getDua(slug);
    if (dua) {
      related.push({ title: dua.title, slug: dua.slug, pillar: slugifyPillar(dua.pillar) });
      continue;
    }

    const guide = getGuide(slug);
    if (guide) {
      related.push({ title: guide.title, slug: guide.slug, pillar: "", href: `/خطوات/${guide.slug}` });
      continue;
    }

    const adhkar = getAdhkarCollection(slug);
    if (adhkar) {
      related.push({ title: adhkar.title, slug: adhkar.slug, pillar: "", href: `/اذكار/${adhkar.slug}` });
    }
  }
  return related;
}
