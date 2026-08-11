import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { TOC, type TOCItem } from "@/components/TOC";
import { getAdhkarCollection, getAllAdhkarSlugs } from "@/lib/adhkar";
import { decodeSlug } from "@/lib/content";
import { truncateForMeta } from "@/lib/arabic";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
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
    title: collection.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { title: collection.title, description, url: canonicalPath, type: "article" },
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
    { label: "اذكار", href: "/اذكار" },
    { label: collection.title, href: `/اذكار/${collection.slug}` },
  ];

  const tocItems: TOCItem[] = [
    { id: "items", label: "الأذكار" },
    { id: "faq", label: "الأسئلة الشائعة" },
    { id: "references", label: "المصادر" },
  ];

  const uniqueSources = [...new Set(collection.items.map((item) => item.primary_source))];

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <JsonLd data={faqSchema(collection.faq)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-4 mt-3 font-sans text-3xl font-bold text-foreground">{collection.title}</h1>

      <p className="mb-8 rounded-lg bg-foreground/[0.03] p-4 text-base leading-relaxed text-foreground/85">
        {collection.quick_answer}
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_14rem]">
        <div className="space-y-10">
          <section id="items" className="scroll-mt-20">
            <AdhkarItemsList items={collection.items} />
          </section>

          <section id="faq" className="scroll-mt-20 space-y-3">
            <h2 className="font-sans text-lg font-semibold text-foreground">الأسئلة الشائعة</h2>
            <FaqAccordion items={collection.faq} />
          </section>

          <section id="references" className="scroll-mt-20 space-y-2">
            <h2 className="font-sans text-lg font-semibold text-foreground">المصادر</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-foreground/70">
              {uniqueSources.map((source) => (
                <li key={source}>{source}</li>
              ))}
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
