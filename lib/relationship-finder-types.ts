import relationshipFinderData from "@/content/relationship-finder.json";
import type { Dua } from "@/lib/schema";

// Client-safe: imports nothing that touches node:fs (lib/schema.ts is pure
// Zod/types, content/relationship-finder.json is a plain JSON asset).
// RelationshipDuaFinder.tsx ("use client") imports from here, never from
// lib/relationship-finder.ts — that file pulls in lib/content.ts's
// node:fs-based getDua(), which broke the client bundle when a single
// function (matrixKey) was re-exported from the same file (Turbopack
// error: "chunking context does not support external modules (node:fs)").

export type AuthenticityGrade = Dua["authenticity_grade"];

export interface Relationship {
  id: string;
  label: string;
  group?: string;
}

export interface Occasion {
  id: string;
  label: string;
  fallbackDuaSlug: string | null;
}

export interface Cell {
  group: string;
  occasion: string;
  intro: string;
  arabic_text_tashkeel: string;
  arabic_text_plain: string;
  authenticity_grade: AuthenticityGrade;
  primary_source: string;
  faq: { q: string; a: string }[];
}

export const relationships: Relationship[] = relationshipFinderData.relationships;
export const occasions: Occasion[] = relationshipFinderData.occasions;
// `authenticity_grade` in the JSON is a plain string to TypeScript's eyes;
// narrowed here since the values are hand-verified against the real enum
// (only "sahih"/"hasan" appear in content/relationship-finder.json today).
export const cells = relationshipFinderData.cells as unknown as Cell[];

export type FinderResultView =
  | {
      kind: "distinct";
      intro: string;
      arabic_text_tashkeel: string;
      arabic_text_plain: string;
      authenticity_grade: AuthenticityGrade;
      primary_source: string;
      faq: { q: string; a: string }[];
    }
  | {
      kind: "fallback";
      intro: string;
      title: string;
      href: string;
      arabic_text_tashkeel: string;
      arabic_text_plain: string;
      authenticity_grade: AuthenticityGrade;
      narrator?: string;
      primary_source: string;
    }
  | { kind: "none" };

export function matrixKey(relationshipId: string, occasionId: string): string {
  return `${relationshipId}::${occasionId}`;
}
