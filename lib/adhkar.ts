import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AdhkarCollectionSchema, type AdhkarCollection } from "@/lib/adhkar-schema";
import { decodeSlug } from "@/lib/content";

const ADHKAR_DIR = join(process.cwd(), "content", "adhkar");

/**
 * File is named after `slug` (the /اذكار/[occasion]/ URL segment — e.g.
 * "صباح", not the more descriptive `occasion` field inside the schema),
 * same convention as content/duas/[slug].json.
 */
export function getAdhkarCollection(slug: string): AdhkarCollection | null {
  const path = join(ADHKAR_DIR, `${decodeSlug(slug)}.json`);
  if (!existsSync(path)) return null;

  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const result = AdhkarCollectionSchema.safeParse(raw);
  if (!result.success) {
    console.error(`content/adhkar/${slug}.json failed schema validation:`, result.error.message);
    return null;
  }
  return result.data;
}

export function getAllAdhkarSlugs(): string[] {
  if (!existsSync(ADHKAR_DIR)) return [];
  return readdirSync(ADHKAR_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}
