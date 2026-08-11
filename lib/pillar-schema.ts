import { z } from "zod";

export const PillarSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  intro_markdown: z.string(),
  child_slugs: z.array(z.string()).default([]),
});

export type Pillar = z.infer<typeof PillarSchema>;
