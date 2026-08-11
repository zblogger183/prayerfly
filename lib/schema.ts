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
 * No `potentialAction`/SearchAction: the plan calls for one, but no
 * /search route exists yet (homepage search is unbuilt). A SearchAction
 * pointing at a URL that 404s is broken structured data, not a shortcut —
 * add it once a real search page ships.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
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
 * No `image`: DuaSchema has no image field and the site has no default OG
 * image asset yet, so there's nothing real to point at. datePublished is
 * set equal to dateModified (last_updated) rather than invented — the
 * schema only ever tracked one date, not a separate original-publish date.
 */
export function articleSchema(dua: Dua, canonicalPath: string) {
  const publisher = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dua.primary_keyword,
    description: dua.quick_answer,
    inLanguage: "ar",
    datePublished: dua.last_updated,
    dateModified: dua.last_updated,
    mainEntityOfPage: absoluteUrl(canonicalPath),
    author: publisher,
    publisher,
  };
}
