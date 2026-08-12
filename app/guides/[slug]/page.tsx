import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopyButton } from "@/components/CopyButton";
import { ErrorReportLink } from "@/components/ErrorReportLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { RelatedDuas } from "@/components/RelatedDuas";
import { TOC, type TOCItem } from "@/components/TOC";
import { decodeSlug, getDua, getRelatedDuas, slugifyPillar } from "@/lib/content";
import { getAllGuideSlugs, getGuide } from "@/lib/guides";
import { truncateForMeta } from "@/lib/arabic";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/schema";

// Physically lives at /guides/[slug] (ASCII), same reason as every route
// since Sprint 4: Next.js 16.3's static export throws InvalidCharacterError
// for a non-ASCII *folder* name. proxy.ts rewrites the real "/خطوات/..."
// public URL here.

export const revalidate = 604800; // weekly ISR

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  const description = truncateForMeta(guide.quick_answer);
  const canonicalPath = `/خطوات/${guide.slug}`;

  return {
    title: guide.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { title: guide.title, description, url: canonicalPath, type: "article" },
    ...(guide.index ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(decodeSlug(slug));
  if (!guide) notFound();

  const relatedDuas = getRelatedDuas(guide);
  const canonicalPath = `/خطوات/${guide.slug}`;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: guide.title, href: canonicalPath },
  ];

  const tocItems: TOCItem[] = [
    { id: "steps", label: "الخطوات" },
    { id: "faq", label: "الأسئلة الشائعة" },
    ...(relatedDuas.length > 0 ? [{ id: "related", label: "أدعية ذات صلة" }] : []),
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={howToSchema(guide)} />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <JsonLd data={faqSchema(guide.faq)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-4 mt-3 font-sans text-3xl font-bold text-primary">{guide.title}</h1>

      <p className="mb-8 rounded-lg bg-foreground/[0.03] p-4 text-base leading-relaxed text-foreground/85">
        {guide.quick_answer}
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_14rem]">
        <div className="space-y-10">
          <section id="steps" className="scroll-mt-20">
            <ol className="space-y-8">
              {guide.steps.map((step) => {
                const associatedDua = step.associated_dua_slug
                  ? getDua(step.associated_dua_slug)
                  : null;

                return (
                  <li
                    key={step.order}
                    className="space-y-3 border-b border-foreground/10 pb-8 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {step.order}
                      </span>
                      <h3 className="font-sans text-lg font-semibold text-foreground">
                        {step.step_title}
                      </h3>
                    </div>

                    <div className="prose prose-sm max-w-none text-foreground/85">
                      <MDXRemote source={step.step_description} />
                    </div>

                    {associatedDua && (
                      <div className="space-y-2 rounded-lg border border-foreground/10 p-4">
                        <p dir="rtl" className="font-naskh text-xl leading-loose text-foreground">
                          {associatedDua.arabic_text_plain}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Link
                            href={`/دعاء/${slugifyPillar(associatedDua.pillar)}/${associatedDua.slug}`}
                            className="text-sm text-primary hover:underline"
                          >
                            الصفحة الكاملة للدعاء ودرجة صحته ←
                          </Link>
                          <CopyButton text={associatedDua.arabic_text_plain} />
                        </div>
                      </div>
                    )}

                    {step.inline_dua_text && (
                      <div className="space-y-2 rounded-lg border border-foreground/10 p-4">
                        <p dir="rtl" className="font-naskh text-xl leading-loose text-foreground">
                          {step.inline_dua_text}
                        </p>
                        <CopyButton text={step.inline_dua_text} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <section id="faq" className="scroll-mt-20 space-y-3">
            <h2 className="font-sans text-lg font-semibold text-primary">الأسئلة الشائعة</h2>
            <FaqAccordion items={guide.faq} />
          </section>

          {relatedDuas.length > 0 && (
            <section id="related" className="scroll-mt-20 space-y-3">
              <h2 className="font-sans text-lg font-semibold text-primary">أدعية ذات صلة</h2>
              <RelatedDuas items={relatedDuas} />
            </section>
          )}

          <ErrorReportLink pageTitle={guide.title} pageUrl={canonicalPath} />
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
