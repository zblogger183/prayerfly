import { Suspense } from "react";
import Link from "next/link";
import { BookOpenCheck, Compass, Library, ShieldCheck } from "lucide-react";

import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { GeometricPattern } from "@/components/GeometricPattern";
import { HomeSearch, HomeSearchWithQuery } from "@/components/HomeSearch";
import { JsonLd } from "@/components/JsonLd";
import { Logo } from "@/components/Logo";
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

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "درجة الصحة ظاهرة دائمًا",
    body: "كل دعاء مصنّف صحيح أو حسن أو ضعيف قبل أن تقرأه، لا بعد.",
  },
  {
    icon: BookOpenCheck,
    title: "تخريج من الدرر السنية",
    body: "كل حكم مراجَع مباشرة عبر الموسوعة الحديثية، مع الراوي والمصدر ورقم الحديث.",
  },
  {
    icon: Library,
    title: "لا نخترع نصًا",
    body: "حين لا يثبت دعاء محدد عن النبي ﷺ، نصرّح بذلك بدل تقديم نص مشهور على أنه ثابت.",
  },
];

export const revalidate = 604800; // weekly ISR, same as every content route

export default function Home() {
  const index = getSearchIndex();
  const pillars = [...getAllPillarHubs()].sort((a, b) => b.children.length - a.children.length);
  const featuredDuas = getFeaturedDuas(FEATURED_COUNT);
  const totalDuas = pillars.reduce((sum, p) => sum + p.children.length, 0);

  return (
    <div>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />

      {/* 1. Hero — background stays solid white per Section 8; the geometric
          pattern is an outline at ~6% opacity, so it reads as texture, not
          a color wash. Brand color itself still only appears in small
          deliberate touches (logo, underline, CTA, stat numbers). */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-background px-6 pb-16 pt-20 text-center sm:pb-20 sm:pt-24">
        <GeometricPattern className="pointer-events-none absolute inset-0 h-full w-full text-primary/[0.06] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)]" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <Logo className="size-12 text-primary" />
            <div className="flex flex-col items-center gap-2">
              <span className="font-sans text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                PrayerFly
              </span>
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-secondary" />
            </div>
          </div>
          <p className="font-sans text-lg text-foreground/70">أدعية موثقة بإسناد صحيح</p>

          <p className="font-naskh max-w-md text-2xl leading-loose text-foreground/90">
            بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/دعاء"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
            >
              <Compass className="size-4" />
              تصفح الأدعية
            </Link>
            <a
              href="#search"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
            >
              ابحث عن دعاء
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-foreground/60">
            <span className="flex items-baseline gap-1.5">
              <span className="font-sans text-lg font-bold text-primary">{totalDuas}+</span>
              دعاء موثق
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-sans text-lg font-bold text-primary">{pillars.length}</span>
              بابًا وموضوعًا
            </span>
            <span className="flex items-baseline gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              درجة صحة ظاهرة لكل نص
            </span>
          </div>
        </div>
      </section>

      {/* 2. Search */}
      <section id="search" className="scroll-mt-16 border-b border-foreground/10 bg-surface px-6 py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="font-sans text-xl font-semibold text-primary">ابحث عن دعائك</h2>
          <Suspense fallback={<HomeSearch index={index} />}>
            <HomeSearchWithQuery index={index} />
          </Suspense>
        </div>
      </section>

      {/* 3. Pillar browse grid */}
      <section id="pillars" className="scroll-mt-16 border-b border-foreground/10 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-sans text-xl font-semibold text-primary">تصفح حسب الموضوع</h2>
            <Link
              href="/دعاء"
              className="text-sm font-medium text-primary hover:underline"
            >
              كل الأبواب ({pillars.length}) ←
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pillars.slice(0, 12).map((pillar) => (
              <Link
                key={pillar.pillarSlug}
                href={`/دعاء/${pillar.pillarSlug}`}
                className="group flex flex-col gap-1 rounded-xl border border-foreground/10 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
              >
                <span className="font-medium text-foreground group-hover:text-primary">
                  {pillar.pillarName}
                </span>
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
                className="flex flex-col gap-3 rounded-xl border border-foreground/10 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
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

      {/* 5. Trust points */}
      <section className="bg-surface px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary">
                <point.icon className="size-5" />
              </span>
              <h3 className="font-sans font-semibold text-foreground">{point.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/60">{point.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
