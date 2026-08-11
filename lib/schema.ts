import { z } from "zod";

export const DuaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  pillar: z.string(),
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).default([]),
  quick_answer: z.string().max(400),
  arabic_text_tashkeel: z.string(),
  arabic_text_plain: z.string(),
  authenticity_grade: z.enum(["sahih", "hasan", "daif", "mixed"]),
  narrator: z.string().optional(),
  primary_source: z.string(),
  source_url: z.string().url().optional(),
  occasion: z.string(),
  repetition_count: z.string().optional(),
  ruling: z.string(), // sunnah/mustahabb/wajib
  context_markdown: z.string(), // the "حكم" prose block, rendered via MDX
  variants: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  related_slugs: z.array(z.string()).default([]),
  audio_url: z.string().optional(),
  last_updated: z.string(), // ISO date
  index: z.boolean().default(true), // false = noindex, for guarded programmatic pages
});

export type Dua = z.infer<typeof DuaSchema>;
