import { getDua, slugifyPillar } from "@/lib/content";
import { getAdhkarCollection } from "@/lib/adhkar";
import { getGuide } from "@/lib/guides";
import type { RelatedDua } from "@/components/RelatedDuas";

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
