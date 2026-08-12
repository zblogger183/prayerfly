import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DuaSchema, type Dua } from "@/lib/schema";
import { PillarSchema, type Pillar } from "@/lib/pillar-schema";
import type { RelatedDua } from "@/components/RelatedDuas";

const CONTENT_PLAN_PATH = join(process.cwd(), "content-plan.json");
const DUAS_DIR = join(process.cwd(), "content", "duas");
const PILLARS_DIR = join(process.cwd(), "content", "pillars");

export interface ContentPlanEntry {
  pillar: string;
  canonical_topic: string;
  slug: string;
  total_volume: number;
  difficulty: number | null;
  variant_spellings: string[];
  phase: 1 | 2 | 3;
  source_row_numbers: number[];
}

let cachedPlan: ContentPlanEntry[] | null = null;

/**
 * content-plan.json is Sprint 2's generated output, not hand-authored
 * content — it doesn't go through DuaSchema/validate:content the way
 * content/duas/*.json does, so this just trusts its shape.
 */
export function getContentPlan(): ContentPlanEntry[] {
  if (!cachedPlan) {
    cachedPlan = JSON.parse(readFileSync(CONTENT_PLAN_PATH, "utf-8"));
  }
  return cachedPlan!;
}

/**
 * URL segments can't sensibly contain the raw pillar name once it has
 * spaces in it ("ختم القرآن والسور", "الحج والعمرة", ...) — most pillar
 * names do. Hyphenated the same way scripts/dedupe-clusters.ts hyphenates
 * dua-topic slugs; kept as a separate copy rather than a shared import
 * since that script is intentionally excluded from the app's TS project.
 */
export function slugifyPillar(pillar: string): string {
  return pillar.trim().replace(/\s+/g, "-");
}

function hasContentFile(slug: string): boolean {
  return existsSync(join(DUAS_DIR, `${slug}.json`));
}

/**
 * Only Phase 1/2 entries that already have a written content/duas/*.json
 * file are eligible for static generation right now. Sprint 2 already
 * produced params for all ~394 Phase 1/2 topics, but almost none of them
 * have content yet (Sprint 6/14 write that over time) — prerendering
 * hundreds of guaranteed-empty pages would both slow the build for no
 * reason and make `next build`'s output look far more finished than the
 * site actually is. Anything eligible but not yet written still resolves
 * correctly (as a 404) on demand, since Next's default `dynamicParams`
 * behavior renders unlisted paths the first time they're requested.
 */
export function getBuildableEntries(): ContentPlanEntry[] {
  return getContentPlan().filter(
    (entry) => (entry.phase === 1 || entry.phase === 2) && hasContentFile(entry.slug)
  );
}

/**
 * generateMetadata's `params` and the page component's `params` do not
 * consistently agree on encoding for non-ASCII static-generation values —
 * confirmed empirically: for the same prerendered route, one resolved
 * `slug` as plain "دعاء-السفر", the other as the percent-encoded
 * "%D8%AF...". decodeURIComponent is a safe no-op on an already-decoded
 * string (nothing to unescape), so decoding defensively here handles both
 * cases regardless of which one a given caller happens to receive.
 */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function getDua(slug: string): Dua | null {
  const path = join(DUAS_DIR, `${decodeSlug(slug)}.json`);
  if (!existsSync(path)) return null;

  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const result = DuaSchema.safeParse(raw);
  if (!result.success) {
    console.error(`content/duas/${slug}.json failed schema validation:`, result.error.message);
    return null;
  }
  return result.data;
}

export function getAllDuaSlugs(): string[] {
  if (!existsSync(DUAS_DIR)) return [];
  return readdirSync(DUAS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length));
}

export interface PillarHub {
  pillarName: string;
  pillarSlug: string;
  description?: string;
  introMarkdown?: string;
  children: { title: string; slug: string }[];
}

/**
 * A hand-authored pillar page (content/pillars/*.json) — e.g. "أدعية عامة",
 * the general duas index that ادعيه (a category query, not a single dua)
 * got re-slotted to instead of being forced into DuaSchema. Its child_slugs
 * is an explicit, curated list rather than "every dua whose pillar field
 * happens to match" — deliberate for a general index, but it does mean
 * updating this file as more duas are worth featuring here.
 */
export function getPillarSchemaEntry(pillarSlug: string): Pillar | null {
  const path = join(PILLARS_DIR, `${decodeSlug(pillarSlug)}.json`);
  if (!existsSync(path)) return null;

  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const result = PillarSchema.safeParse(raw);
  if (!result.success) {
    console.error(`content/pillars/${pillarSlug}.json failed schema validation:`, result.error.message);
    return null;
  }
  return result.data;
}

/**
 * Same "only what's actually written" rule as getBuildableEntries: a hub
 * page only lists/exists for pillars that have at least one real dua page
 * OR a hand-authored content/pillars/*.json entry — not every pillar the
 * Sprint 2 classifier happened to assign.
 */
export function getPillarHub(pillarSlug: string): PillarHub | null {
  const decoded = decodeSlug(pillarSlug);
  const schemaEntry = getPillarSchemaEntry(decoded);

  if (schemaEntry) {
    const children = schemaEntry.child_slugs
      .map((slug) => getDua(slug))
      .filter((dua): dua is Dua => dua !== null)
      .map((dua) => ({ title: dua.title, slug: dua.slug }));
    return {
      pillarName: schemaEntry.title,
      pillarSlug: decoded,
      description: schemaEntry.description,
      introMarkdown: schemaEntry.intro_markdown,
      children,
    };
  }

  const autoEntries = getBuildableEntries().filter(
    (entry) => slugifyPillar(entry.pillar) === decoded
  );
  if (autoEntries.length === 0) return null;
  return {
    pillarName: autoEntries[0].pillar,
    pillarSlug: decoded,
    children: autoEntries.map((entry) => ({ title: entry.canonical_topic, slug: entry.slug })),
  };
}

export function getAllPillarHubs(): PillarHub[] {
  const slugs = new Set<string>();
  for (const entry of getBuildableEntries()) {
    slugs.add(slugifyPillar(entry.pillar));
  }
  if (existsSync(PILLARS_DIR)) {
    for (const file of readdirSync(PILLARS_DIR)) {
      if (file.endsWith(".json")) slugs.add(file.slice(0, -".json".length));
    }
  }
  const hubs: PillarHub[] = [];
  for (const slug of slugs) {
    const hub = getPillarHub(slug);
    if (hub) hubs.push(hub);
  }
  return hubs;
}

/**
 * Resolves `related_slugs` (just slug strings in the schema) into the
 * {title, slug, pillar} shape RelatedDuas needs, skipping any slug that
 * doesn't resolve to a real file — a stale/typo'd related_slugs entry
 * should silently drop, not 404 or crash the page it's linked from.
 *
 * Takes `{ related_slugs }` rather than `Dua` specifically so
 * AdhkarCollection entries (which have their own related_slugs field but
 * aren't a Dua) can resolve cross-links into content/duas/ too — the
 * target is always a real dua page either way, since RelatedDuas only
 * knows how to build /دعاء/{pillar}/{slug} hrefs.
 */
export function getRelatedDuas({ related_slugs }: { related_slugs: string[] }): RelatedDua[] {
  const related: RelatedDua[] = [];
  for (const slug of related_slugs) {
    const target = getDua(slug);
    if (target) {
      related.push({ title: target.title, slug: target.slug, pillar: slugifyPillar(target.pillar) });
    }
  }
  return related;
}
