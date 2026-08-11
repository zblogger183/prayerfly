import { z } from "zod";

/**
 * For fixed, ordered, multi-item recitation sets (أذكار الصباح, اذكار
 * التحصين) — a genre with a real, recognized shape distinct from a single
 * dua with variants. Each item carries its own grading/source since a
 * collection routinely mixes items of different authenticity.
 */
export const AdhkarItemSchema = z.object({
  order: z.number(),
  arabic_text_tashkeel: z.string(),
  arabic_text_plain: z.string(),
  authenticity_grade: z.enum(["sahih", "hasan", "daif", "mixed", "no_fixed_hadith"]),
  primary_source: z.string(),
  source_url: z.string().url().optional(),
  repetition_count: z.string().optional(),
});

export const AdhkarCollectionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  occasion: z.string(), // صباح / مساء / تحصين
  quick_answer: z.string().max(400),
  items: z.array(AdhkarItemSchema).min(1),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  related_slugs: z.array(z.string()).default([]),
  audio_url: z.string().optional(),
  last_updated: z.string(),
  index: z.boolean().default(true),
});

export type AdhkarItem = z.infer<typeof AdhkarItemSchema>;
export type AdhkarCollection = z.infer<typeof AdhkarCollectionSchema>;
