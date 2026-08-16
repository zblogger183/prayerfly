import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ErrorReportLink } from "@/components/ErrorReportLink";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { RelatedDuas } from "@/components/RelatedDuas";
import { TOC, type TOCItem } from "@/components/TOC";
import { getAdhkarCollection, getAllAdhkarSlugs } from "@/lib/adhkar";
import { decodeSlug, getRelatedDuas } from "@/lib/content";
import { truncateForMeta, truncateForTitle } from "@/lib/arabic";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { AdhkarItemsList } from "./AdhkarItemsList";

// Physically lives at /azkar/[occasion] (ASCII), same reason as every
// route since Sprint 4: Next.js 16.3's static export throws
// InvalidCharacterError for a non-ASCII *folder* name. proxy.ts rewrites
// the real "/اذكار/..." public URL here.

export const revalidate = 604800; // weekly ISR

export async function generateStaticParams() {
  return getAllAdhkarSlugs().map((slug) => ({ occasion: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ occasion: string }>;
}): Promise<Metadata> {
  const { occasion } = await params;
  const collection = getAdhkarCollection(occasion);
  if (!collection) return {};

  const description = truncateForMeta(collection.quick_answer);
  const canonicalPath = `/اذكار/${collection.slug}`;

  return {
    title: truncateForTitle(collection.title),
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { title: collection.title, description, url: canonicalPath, type: "article" },
    ...(collection.index ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function AdhkarPage({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion } = await params;
  const collection = getAdhkarCollection(decodeSlug(occasion));
  if (!collection) notFound();

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: collection.title, href: `/اذكار/${collection.slug}` },
  ];

  const relatedDuas = getRelatedDuas(collection);
  const canonicalPath = `/اذكار/${collection.slug}`;

  const tocItems: TOCItem[] = [
    { id: "items", label: "الأذكار" },
    { id: "faq", label: "الأسئلة الشائعة" },
    ...(relatedDuas.length > 0 ? [{ id: "related", label: "أدعية ذات صلة" }] : []),
    { id: "references", label: "المصادر" },
  ];

  const uniqueSources = [...new Set(collection.items.map((item) => item.primary_source))];

  return (
    <div dir="rtl" className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd
        data={articleSchema(
          { headline: collection.title, quick_answer: collection.quick_answer, last_updated: collection.last_updated },
          canonicalPath
        )}
      />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <JsonLd data={faqSchema(collection.faq)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-4 mt-3 font-sans text-3xl font-bold text-primary">{collection.title}</h1>

      <div className="mb-8 rounded-xl border border-primary-100 bg-primary-50/50 p-5">
        <p className="mb-1.5 text-xs font-semibold tracking-wide text-primary-700">
          الإجابة السريعة
        </p>
        <p className="text-base leading-relaxed text-foreground/85">{collection.quick_answer}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_15rem]">
        <div className="space-y-10">
          <section id="items" className="scroll-mt-20">
            <AdhkarItemsList items={collection.items} />
          </section>

          <section id="faq" className="scroll-mt-20 space-y-3">
            <h2 className="font-sans text-lg font-semibold text-primary">الأسئلة الشائعة</h2>
            <FaqAccordion items={collection.faq} />
          </section>

          {relatedDuas.length > 0 && (
            <section id="related" className="scroll-mt-20 space-y-3">
              <h2 className="font-sans text-lg font-semibold text-primary">أدعية ذات صلة</h2>
              <RelatedDuas items={relatedDuas} />
            </section>
          )}

          <section id="references" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-primary">المصادر</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-foreground/70">
              {uniqueSources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ol>
          </section>

          <ErrorReportLink pageTitle={collection.title} pageUrl={`/اذكار/${collection.slug}`} />
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
