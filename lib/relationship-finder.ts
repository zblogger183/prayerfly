import { getDua, slugifyPillar } from "@/lib/content";
import {
  cells,
  matrixKey,
  occasions,
  relationships,
  type FinderResultView,
} from "@/lib/relationship-finder-types";

export { relationships, occasions, matrixKey };
export type { Relationship, Occasion, FinderResultView } from "@/lib/relationship-finder-types";

/**
 * Server-only (reads content/duas/*.json via getDua, which touches
 * node:fs) — the client component never imports this file directly (see
 * lib/relationship-finder-types.ts). The page server component calls this
 * once, builds the whole matrix (13 relationships × 5 occasions = 65 cheap
 * lookups, mostly sharing the same 4 underlying dua objects), and passes
 * the plain, serializable result down as props.
 *
 * Guardrail from Section 4.3, applied here rather than at content-authoring
 * time: a (relationship, occasion) pair either matches a hand-written cell
 * with real, sourced structural variance, or falls back to the occasion's
 * already-verified general dua with a personalized intro sentence — the
 * sourced dua/hadith text itself is never altered, only the human-facing
 * wrapper. If neither exists (a relationship with no distinct cell asking
 * for "الخير بشكل عام", which has no fallback dua by design), this returns
 * "none" rather than inventing or recycling unrelated content.
 */
export function getFinderMatrix(): Record<string, FinderResultView> {
  const matrix: Record<string, FinderResultView> = {};

  for (const relationship of relationships) {
    for (const occasion of occasions) {
      const key = matrixKey(relationship.id, occasion.id);

      const cell = cells.find(
        (c) => c.group === relationship.group && c.occasion === occasion.id
      );
      if (cell) {
        matrix[key] = {
          kind: "distinct",
          intro: cell.intro,
          arabic_text_tashkeel: cell.arabic_text_tashkeel,
          arabic_text_plain: cell.arabic_text_plain,
          authenticity_grade: cell.authenticity_grade,
          primary_source: cell.primary_source,
          faq: cell.faq,
        };
        continue;
      }

      if (occasion.fallbackDuaSlug) {
        const dua = getDua(occasion.fallbackDuaSlug);
        if (dua) {
          matrix[key] = {
            kind: "fallback",
            intro: `هذا الدعاء الثابت مناسب للدعاء ل${relationship.label} في هذه الحالة:`,
            title: dua.title,
            href: `/دعاء/${slugifyPillar(dua.pillar)}/${dua.slug}`,
            arabic_text_tashkeel: dua.arabic_text_tashkeel,
            arabic_text_plain: dua.arabic_text_plain,
            authenticity_grade: dua.authenticity_grade,
            narrator: dua.narrator,
            primary_source: dua.primary_source,
          };
          continue;
        }
      }

      matrix[key] = { kind: "none" };
    }
  }

  return matrix;
}
