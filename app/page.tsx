import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { HomeSearch, HomeSearchWithQuery } from "@/components/HomeSearch";
import { JsonLd } from "@/components/JsonLd";
import { truncateForMeta } from "@/lib/arabic";
import { getAllPillarHubs, getBuildableEntries, getDua, slugifyPillar } from "@/lib/content";
import { getSearchIndex } from "@/lib/search-index";
import { organizationSchema, websiteSchema } from "@/lib/schema";

const FEATURED_COUNT = 8;

/**
 * Highest-`total_volume` Phase-1 topics that actually have a written file —
 * content-plan.json's slugs and the real content/duas/*.json slugs have
 * drifted apart in a few places since Sprint 6 (e.g. "ادعيه" was never
 * built as a standalone dua, "دعاء-الصباح" became the أذكار الصباح
 * collection instead), so this resolves through getDua() and silently
 * skips anything that isn't a real file rather than linking a 404.
 */
function getFeaturedDuas(limit: number) {
  const ranked = [...getBuildableEntries()].sort((a, b) => b.total_volume - a.total_volume);
  const featured = [];
  for (const entry of ranked) {
    const dua = getDua(entry.slug);
    if (dua && dua.index) featured.push(dua);
    if (featured.length >= limit) break;
  }
  return featured;
}

export const revalidate = 604800; // weekly ISR, same as every content route

export default function Home() {
  const index = getSearchIndex();
  const pillars = [...getAllPillarHubs()].sort((a, b) => b.children.length - a.children.length);
  const featuredDuas = getFeaturedDuas(FEATURED_COUNT);

  return (
    <div>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />

      {/* 1. Hero — solid white, per Section 8: brand color stays in small
          deliberate touches (the underline accent below), never a large
          background wash. */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-background px-6 py-20 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              PrayerFly
            </span>
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-secondary" />
          </div>
          <p className="font-sans text-lg text-foreground/70">أدعية موثقة بإسناد صحيح</p>
          <p className="font-naskh max-w-md text-2xl leading-loose text-foreground/90">
            بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ
          </p>
        </div>
      </section>

      {/* 2. Search */}
      <section className="border-b border-foreground/10 px-6 py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="font-sans text-xl font-semibold text-primary">
            ابحث عن دعائك
          </h2>
          <Suspense fallback={<HomeSearch index={index} />}>
            <HomeSearchWithQuery index={index} />
          </Suspense>
        </div>
      </section>

      {/* 3. Pillar browse grid */}
      <section id="pillars" className="scroll-mt-16 border-b border-foreground/10 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-sans text-xl font-semibold text-primary">
            تصفح حسب الموضوع
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pillars.map((pillar) => (
              <Link
                key={pillar.pillarSlug}
                href={`/دعاء/${pillar.pillarSlug}`}
                className="group flex flex-col gap-1 rounded-xl border border-foreground/10 p-4 transition-colors hover:border-primary/40 hover:ring-1 hover:ring-secondary/50"
              >
                <span className="font-medium text-foreground">{pillar.pillarName}</span>
                <span className="flex items-center gap-1.5 text-sm text-foreground/50">
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-secondary" />
                  {pillar.children.length} {pillar.children.length === 1 ? "دعاء" : "أدعية"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured duas */}
      <section className="border-b border-foreground/10 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-sans text-xl font-semibold text-primary">
            الأدعية الأكثر بحثًا
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDuas.map((dua) => (
              <Link
                key={dua.slug}
                href={`/دعاء/${slugifyPillar(dua.pillar)}/${dua.slug}`}
                className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-5 transition-colors hover:border-primary/40 hover:bg-foreground/[0.02] hover:ring-1 hover:ring-secondary/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-sans font-semibold text-foreground">{dua.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {truncateForMeta(dua.quick_answer, 90)}
                </p>
                <div className="mt-auto pt-1">
                  <AuthenticityBadge
                    grade={dua.authenticity_grade}
                    narrator={dua.narrator}
                    source={dua.primary_source}
                    compact
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trust statement */}
      <section className="px-6 py-10">
        <p className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-center text-sm text-foreground/60">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          كل دعاء في PrayerFly موثّق بإسناد صحيح ومصدره الأصلي، ودرجة صحته ظاهرة قبل أن تقرأه.
        </p>
      </section>
    </div>
  );
}
