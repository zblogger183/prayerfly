import { z } from "zod";

/**
 * For step-by-step procedures with a dua embedded per step (خطوات العمرة).
 * A step's dua is either a reference into content/duas/ (when that dua
 * also has independent search demand and deserves its own page) or inline
 * text (when it doesn't) — never both, and a step may have neither if it's
 * a purely procedural step with no associated dua.
 */
export const GuideStepSchema = z.object({
  order: z.number(),
  step_title: z.string(),
  step_description: z.string(), // markdown
  associated_dua_slug: z.string().optional(), // reference into content/duas/
  inline_dua_text: z.string().optional(), // for a step with no standalone dua page
});

export const GuideSchema = z.object({
  title: z.string(),
  slug: z.string(),
  pillar: z.string(),
  quick_answer: z.string().max(400),
  steps: z.array(GuideStepSchema).min(2),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  related_slugs: z.array(z.string()).default([]),
  last_updated: z.string(),
  index: z.boolean().default(true),
});

export type GuideStep = z.infer<typeof GuideStepSchema>;
export type Guide = z.infer<typeof GuideSchema>;
