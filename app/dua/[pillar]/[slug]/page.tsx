import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqAccordion } from "@/components/FaqAccordion";
import { RelatedDuas } from "@/components/RelatedDuas";
import { TOC, type TOCItem } from "@/components/TOC";
import { truncateForMeta } from "@/lib/arabic";
import { decodeSlug, getBuildableEntries, getDua, getRelatedDuas, slugifyPillar } from "@/lib/content";
import { DuaActions } from "./DuaActions";

// NOTE: this route physically lives at /dua/[pillar]/[slug] (ASCII) rather
// than /دعاء/[pillar]/[slug] as PROJECT_PLAN.md's URL structure specifies.
// Next.js 16.3's static export throws InvalidCharacterError for ANY
// non-ASCII *static* route segment (confirmed via isolated repro: a fully
// static page with zero dynamic params, under nothing but an "app/دعاء/"
// folder, fails the same way — this is not about dynamic param values,
// which work fine, only about non-ASCII folder names in the route itself).
// The public-facing URL is restored to the real "/دعاء/..." path via
// next.config.ts's rewrites(), so this is invisible to users/crawlers —
// every href, canonical, and OpenGraph URL in this file still points at
// "/دعاء/...".

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

  return {
    title: dua.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: dua.title,
      description,
      url: canonicalPath,
      type: "article",
    },
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
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "دعاء", href: "/دعاء" },
          { label: dua.pillar, href: `/دعاء/${pillar}` },
          { label: dua.title, href: `/دعاء/${pillar}/${dua.slug}` },
        ]}
      />

      {/* 1. H1 — exact primary keyword phrasing */}
      <h1 className="mb-4 mt-3 font-sans text-3xl font-bold text-foreground">
        {dua.primary_keyword}
      </h1>

      {/* 2. Quick-answer block */}
      <p className="mb-8 rounded-lg bg-foreground/[0.03] p-4 text-base leading-relaxed text-foreground/85">
        {dua.quick_answer}
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_14rem]">
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
          <section id="authenticity" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-foreground">درجة الصحة</h2>
            <AuthenticityBadge
              grade={dua.authenticity_grade}
              narrator={dua.narrator}
              source={dua.primary_source}
            />
            {dua.source_url && (
              <p className="text-sm">
                <a
                  href={dua.source_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-emerald-700 hover:underline"
                >
                  التخريج الكامل على الدرر السنية
                </a>
              </p>
            )}
          </section>

          {/* 5. When / how many times to say it */}
          <section id="when" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-foreground">متى وكم مرة تُقال</h2>
            <ul className="list-inside list-disc space-y-1 text-foreground/80">
              <li>{dua.occasion}</li>
              {dua.repetition_count && <li>{dua.repetition_count}</li>}
            </ul>
          </section>

          {/* 6. Context & ruling */}
          <section id="ruling" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-foreground">الحكم والسياق</h2>
            <p className="text-sm font-medium text-foreground/60">الحكم: {dua.ruling}</p>
            <div className="prose prose-sm max-w-none text-foreground/85">
              <MDXRemote source={dua.context_markdown} />
            </div>
          </section>

          {/* 7. Variants (only if the cluster includes them) */}
          {dua.variants.length > 0 && (
            <section id="variants" className="scroll-mt-20 space-y-3">
              <h2 className="font-sans text-lg font-semibold text-foreground">صيغ أخرى</h2>
              {dua.variants.map((variant) => (
                <div key={variant.label}>
                  <p className="mb-1 text-sm font-medium text-foreground/60">{variant.label}</p>
                  <p dir="rtl" className="font-naskh text-xl leading-loose text-foreground">
                    {variant.text}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* 8. FAQ */}
          <section id="faq" className="scroll-mt-20 space-y-3">
            <h2 className="font-sans text-lg font-semibold text-foreground">الأسئلة الشائعة</h2>
            <FaqAccordion items={dua.faq} />
          </section>

          {/* 9. Related duas */}
          {relatedDuas.length > 0 && (
            <section id="related" className="scroll-mt-20 space-y-3">
              <h2 className="font-sans text-lg font-semibold text-foreground">أدعية ذات صلة</h2>
              <RelatedDuas items={relatedDuas} />
            </section>
          )}

          {/* 10. References */}
          <section id="references" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-foreground">المصادر</h2>
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
                      className="text-emerald-700 hover:underline"
                    >
                      dorar.net
                    </a>
                  </>
                ) : null}
              </li>
            </ol>
          </section>
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
