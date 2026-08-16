import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ErrorReportLink } from "@/components/ErrorReportLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { RelatedDuas } from "@/components/RelatedDuas";
import { TOC, type TOCItem } from "@/components/TOC";
import { truncateForMeta, truncateForTitle } from "@/lib/arabic";
import { decodeSlug, getBuildableEntries, getDua, getRelatedDuas, slugifyPillar } from "@/lib/content";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { DuaActions } from "./DuaActions";

// NOTE: this route physically lives at /dua/[pillar]/[slug] (ASCII) rather
// than /دعاء/[pillar]/[slug] as PROJECT_PLAN.md's URL structure specifies.
// Next.js 16.3's static export throws InvalidCharacterError for ANY
// non-ASCII *static* route segment (confirmed via isolated repro: a fully
// static page with zero dynamic params, under nothing but an "app/دعاء/"
// folder, fails the same way — this is not about dynamic param values,
// which work fine, only about non-ASCII folder names in the route itself).
// The public-facing URL is restored to the real "/دعاء/..." path by
// proxy.ts, so this is invisible to users/crawlers — every href,
// canonical, and OpenGraph URL in this file still points at "/دعاء/...".

export const revalidate = 604800; // weekly ISR

export async function generateStaticParams() {
  return getBuildableEntries().map((entry) => ({
    pillar: slugifyPillar(entry.pillar),
    slug: entry.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dua = getDua(slug);
  if (!dua) return {};

  const description = truncateForMeta(dua.quick_answer);
  const canonicalPath = `/دعاء/${slugifyPillar(dua.pillar)}/${dua.slug}`;
  // Meta <title> tracks the H1's exact-keyword phrasing (primary_keyword)
  // rather than the more descriptive `title` field — keeps the title tag
  // aligned with the on-page H1 for topical relevance, and stays under
  // Google's ~60-char SERP truncation point, which `title` alone missed
  // on roughly a fifth of pages (some run well past 80 chars with brand
  // suffix included).
  const metaTitle = truncateForTitle(dua.primary_keyword);

  return {
    title: metaTitle,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: dua.title,
      description,
      url: canonicalPath,
      type: "article",
    },
    ...(dua.index ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function DuaPage({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar: pillarParam, slug } = await params;
  const pillar = decodeSlug(pillarParam);
  const dua = getDua(slug);

  // Also guards against a slug being reached under the wrong pillar
  // segment — e.g. an old/stale link — rather than silently rendering it
  // under a URL that isn't its real canonical path.
  if (!dua || slugifyPillar(dua.pillar) !== pillar) {
    notFound();
  }

  const relatedDuas = getRelatedDuas(dua);
  const canonicalPath = `/دعاء/${pillar}/${dua.slug}`;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: dua.pillar, href: `/دعاء/${pillar}` },
    { label: dua.title, href: canonicalPath },
  ];

  const tocItems: TOCItem[] = [
    { id: "authenticity", label: "درجة الصحة" },
    { id: "when", label: "متى وكم مرة تُقال" },
    { id: "ruling", label: "الحكم والسياق" },
    ...(dua.variants.length > 0 ? [{ id: "variants", label: "صيغ أخرى" }] : []),
    { id: "faq", label: "الأسئلة الشائعة" },
    ...(relatedDuas.length > 0 ? [{ id: "related", label: "أدعية ذات صلة" }] : []),
    { id: "references", label: "المصادر" },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd
        data={articleSchema(
          { headline: dua.primary_keyword, quick_answer: dua.quick_answer, last_updated: dua.last_updated },
          canonicalPath
        )}
      />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <JsonLd data={faqSchema(dua.faq)} />

      <Breadcrumbs items={breadcrumbItems} />

      {/* 1. H1 — exact primary keyword phrasing */}
      <h1 className="mb-4 mt-3 font-sans text-3xl font-bold text-primary">
        {dua.primary_keyword}
      </h1>

      {/* 2. Quick-answer block */}
      <div className="mb-8 rounded-xl border border-primary-100 bg-primary-50/50 p-5">
        <p className="mb-1.5 text-xs font-semibold tracking-wide text-primary-700">
          الإجابة السريعة
        </p>
        <p className="text-base leading-relaxed text-foreground/85">{dua.quick_answer}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_15rem]">
        <div className="space-y-10">
          {/* 3. The dua itself */}
          <DuaActions
            textTashkeel={dua.arabic_text_tashkeel}
            textPlain={dua.arabic_text_plain}
            title={dua.title}
            slug={dua.slug}
            audioUrl={dua.audio_url}
          />

          {/* 4. Authenticity block */}
          <section id="authenticity" className="scroll-mt-20 space-y-3">
            <h2 className="font-sans text-lg font-semibold text-primary">درجة الصحة</h2>
            <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <AuthenticityBadge
                grade={dua.authenticity_grade}
                narrator={dua.narrator}
                source={dua.primary_source}
              />
              {dua.source_url && (
                <a
                  href={dua.source_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  التخريج الكامل ←
                </a>
              )}
            </div>
          </section>

          {/* 5. When / how many times to say it */}
          <section id="when" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-primary">متى وكم مرة تُقال</h2>
            <ul className="list-inside list-disc space-y-1 text-foreground/80">
              <li>{dua.occasion}</li>
              {dua.repetition_count && <li>{dua.repetition_count}</li>}
            </ul>
          </section>

          {/* 6. Context & ruling */}
          <section id="ruling" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-primary">الحكم والسياق</h2>
            <p className="text-sm font-medium text-foreground/60">الحكم: {dua.ruling}</p>
            <div className="prose prose-sm max-w-none text-foreground/85">
              <MDXRemote source={dua.context_markdown} />
            </div>
          </section>

          {/* 7. Variants (only if the cluster includes them) */}
          {dua.variants.length > 0 && (
            <section id="variants" className="scroll-mt-20 space-y-3">
              <h2 className="font-sans text-lg font-semibold text-primary">صيغ أخرى</h2>
              {dua.variants.map((variant) => (
                <div key={variant.label} className="rounded-xl border border-foreground/10 bg-surface p-4">
                  <p className="mb-1.5 text-sm font-medium text-foreground/60">{variant.label}</p>
                  <p dir="rtl" className="font-naskh text-xl leading-loose text-foreground">
                    {variant.text}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* 8. FAQ */}
          <section id="faq" className="scroll-mt-20 space-y-3">
            <h2 className="font-sans text-lg font-semibold text-primary">الأسئلة الشائعة</h2>
            <FaqAccordion items={dua.faq} />
          </section>

          {/* 9. Related duas */}
          {relatedDuas.length > 0 && (
            <section id="related" className="scroll-mt-20 space-y-3">
              <h2 className="font-sans text-lg font-semibold text-primary">أدعية ذات صلة</h2>
              <RelatedDuas items={relatedDuas} />
            </section>
          )}

          {/* 10. References */}
          <section id="references" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-primary">المصادر</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-foreground/70">
              <li>
                {dua.primary_source}
                {dua.narrator ? ` — الراوي: ${dua.narrator}` : ""}
                {dua.source_url ? (
                  <>
                    {" — "}
                    <a
                      href={dua.source_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-primary hover:underline"
                    >
                      {new URL(dua.source_url).hostname.replace(/^www\./, "")}
                    </a>
                  </>
                ) : null}
              </li>
            </ol>
          </section>

          <ErrorReportLink pageTitle={dua.title} pageUrl={canonicalPath} />
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-6">
            <TOC items={tocItems} />
          </div>
        </aside>
      </div>
    </div>
  );
}
