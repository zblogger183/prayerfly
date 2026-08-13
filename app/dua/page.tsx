import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllPillarHubs } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

// Physically lives at /dua (ASCII), same reason as every route since
// Sprint 4 — proxy.ts rewrites the real "/دعاء" public URL here. This is
// the standalone browse-all-pillars index Header.tsx's own comment flagged
// as missing; the homepage's #pillars section still exists separately for
// the "most searched" framing, this page is the dedicated directory.

const canonicalPath = "/دعاء";

export const revalidate = 604800; // weekly ISR, same as every content route

export const metadata: Metadata = {
  title: "تصفح الأدعية حسب الموضوع",
  description: "دليل كامل لكل أبواب الأدعية الموثقة في PrayerFly، مرتبة حسب الموضوع.",
  alternates: { canonical: canonicalPath },
};

export default function DuaIndexPage() {
  const pillars = [...getAllPillarHubs()].sort((a, b) => b.children.length - a.children.length);
  const alphabetical = [...pillars].sort((a, b) => a.pillarName.localeCompare(b.pillarName, "ar"));

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "تصفح الأدعية", href: canonicalPath },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-3 mt-3 font-sans text-3xl font-bold text-primary">
        تصفح الأدعية حسب الموضوع
      </h1>
      <p className="mb-10 max-w-2xl text-foreground/70">
        {pillars.length} بابًا من الأدعية الموثقة، كل دعاء فيها مذكور بدرجة صحته ومصدره الأصلي.
        استخدم القائمة للانتقال المباشر إلى أي باب.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar — an A→Z jump list, the closest thing this content type
            has to Sunnah.com's book list / Quran.com's surah list: every
            pillar is one click away without scrolling the whole grid. */}
        <aside className="hidden lg:block">
          <nav aria-label="فهرس الأبواب" className="sticky top-20">
            <p className="mb-3 text-sm font-semibold text-foreground/50">كل الأبواب</p>
            <ol className="max-h-[70vh] space-y-0.5 overflow-y-auto border-e border-foreground/10 pe-4 text-sm">
              {alphabetical.map((pillar) => (
                <li key={pillar.pillarSlug}>
                  <a
                    href={`#${pillar.pillarSlug}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-foreground/70 transition-colors hover:bg-primary-50 hover:text-primary"
                  >
                    <span>{pillar.pillarName}</span>
                    <span className="text-xs text-foreground/40">{pillar.children.length}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* Main grid — sorted by richness (most duas first), same ordering
            the homepage's #pillars section already used. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.pillarSlug}
              id={pillar.pillarSlug}
              href={`/دعاء/${pillar.pillarSlug}`}
              className="group scroll-mt-20 rounded-xl border border-foreground/10 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-sans font-semibold text-foreground group-hover:text-primary">
                  {pillar.pillarName}
                </span>
                <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {pillar.children.length}
                </span>
              </div>
              {pillar.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-foreground/60">
                  {pillar.description}
                </p>
              ) : (
                <p className="text-sm text-foreground/50">
                  {pillar.children.length === 1 ? "دعاء واحد موثق" : `${pillar.children.length} أدعية موثقة`}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
