import { z } from "zod";
import type { Guide } from "@/lib/guide-schema";

export const DuaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  pillar: z.string(),
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).default([]),
  quick_answer: z.string().max(400),
  arabic_text_tashkeel: z.string(),
  arabic_text_plain: z.string(),
  // "no_fixed_hadith": for duas with no single fixed prophetic (marfūʿ)
  // wording — a scholarly-compiled or companion-practice text (e.g. دعاء
  // ختم القرآن) — where forcing a sahih/hasan/daif grade would misrepresent
  // it as a graded hadith it isn't.
  authenticity_grade: z.enum(["sahih", "hasan", "daif", "mixed", "no_fixed_hadith"]),
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

// ---------------------------------------------------------------------------
// schema.org JSON-LD builders (Sprint 5). Plain data in, plain object out —
// components/JsonLd.tsx is the only place that turns these into a <script>
// tag, so the XSS-safe serialization only needs to be gotten right once.
// ---------------------------------------------------------------------------

const SITE_URL = "https://prayerfly.com";
const SITE_NAME = "PrayerFly";

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * No logo/sameAs: there's no branded logo image asset yet and no social
 * profiles to link. schema.org doesn't require either — add them here once
 * they exist rather than pointing at a placeholder image that doesn't.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

/**
 * Sprint 9: homepage search reads `?q=` (HomeSearch's `initialQuery` prop),
 * so this target is a real, working entry point now, not a placeholder.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbSchemaItem {
  label: string;
  href: string;
}

/**
 * Takes the same {label, href}[] shape the visual Breadcrumbs component
 * (Sprint 3) renders from, instead of a (pillar, dua) pair as the plan's
 * task list illustrates — a fixed 4-level (Home/دعاء/Pillar/Dua) signature
 * can't also describe the pillar hub page's 3-level trail, and building
 * the list twice from raw pillar/dua fields risks the visible breadcrumbs
 * and the structured data quietly drifting apart. One list, fed to both.
 */
export function breadcrumbSchema(items: BreadcrumbSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqSchema(faq: Dua["faq"]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/**
 * Per Section 6 of the plan: no desktop rich result renders for HowTo
 * anymore, but the markup stays valid and AI-crawler-useful, so it's worth
 * the few lines. `text` is the raw step_description markdown source, not
 * rendered HTML — acceptable for HowToStep's plain-text expectation since
 * these are written as short prose, not heavy markdown.
 */
export function howToSchema(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.quick_answer,
    step: guide.steps.map((step) => ({
      "@type": "HowToStep",
      position: step.order,
      name: step.step_title,
      text: step.step_description,
    })),
  };
}

/**
 * No `image`: DuaSchema has no image field and the site has no default OG
 * image asset yet, so there's nothing real to point at. datePublished is
 * set equal to dateModified (last_updated) rather than invented — the
 * schema only ever tracked one date, not a separate original-publish date.
 */
/**
 * Takes the minimal shape rather than `Dua` specifically — same reasoning
 * as getRelatedDuas's generalization in lib/content.ts — so adhkar
 * collections (which have no `primary_keyword`, just `title`) can produce
 * Article JSON-LD too, not only dua pages. `headline` is passed
 * pre-resolved by the caller (dua pages use primary_keyword to match their
 * H1; adhkar collections use title, their only headline-shaped field).
 */
export function articleSchema(
  entry: { headline: string; quick_answer: string; last_updated: string },
  canonicalPath: string
) {
  const publisher = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.headline,
    description: entry.quick_answer,
    inLanguage: "ar",
    datePublished: entry.last_updated,
    dateModified: entry.last_updated,
    mainEntityOfPage: absoluteUrl(canonicalPath),
    // Matches the URL Next.js's opengraph-image.tsx file convention serves
    // for this same route segment (every dua/azkar/guide/pillar route has
    // one, see lib/og-image.tsx) — kept as a plain string template rather
    // than importing next/og machinery into this module, since the two
    // just need to agree on the URL shape, not share code.
    image: absoluteUrl(`${canonicalPath}/opengraph-image`),
    author: publisher,
    publisher,
  };
}
