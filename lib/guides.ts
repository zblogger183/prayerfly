import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GuideSchema, type Guide } from "@/lib/guide-schema";
import { decodeSlug } from "@/lib/content";

const GUIDES_DIR = join(process.cwd(), "content", "guides");

/**
 * File is named after `slug` (the /خطوات/[slug]/ URL segment), same
 * convention as content/duas/[slug].json and content/adhkar/[slug].json.
 */
export function getGuide(slug: string): Guide | null {
  const path = join(GUIDES_DIR, `${decodeSlug(slug)}.json`);
  if (!existsSync(path)) return null;

  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const result = GuideSchema.safeParse(raw);
  if (!result.success) {
    console.error(`content/guides/${slug}.json failed schema validation:`, result.error.message);
    return null;
  }
  return result.data;
}

export function getAllGuideSlugs(): string[] {
  if (!existsSync(GUIDES_DIR)) return [];
  return readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}
