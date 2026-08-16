import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpenCheck, Compass, Library, ShieldCheck } from "lucide-react";

import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { GeometricPattern } from "@/components/GeometricPattern";
import { HomeSearch, HomeSearchWithQuery } from "@/components/HomeSearch";
import { JsonLd } from "@/components/JsonLd";
import { truncateForMeta } from "@/lib/arabic";
import { getAllPillarHubs, getBuildableEntries, getDua, slugifyPillar } from "@/lib/content";
import { getPillarIcon } from "@/lib/pillar-style";
import { getSearchIndex } from "@/lib/search-index";
import { organizationSchema, websiteSchema } from "@/lib/schema";

/** Same grade→color mapping AuthenticityBadge uses, condensed to just the
 * accent bar/tint each featured-dua card needs — kept here rather than
 * exported from that component since this shape (bar + soft tint) is
 * specific to the card layout, not the badge itself. */
const GRADE_ACCENT: Record<string, { bar: string; tint: string }> = {
  sahih: { bar: "bg-primary", tint: "bg-primary-50" },
  hasan: { bar: "bg-teal-500", tint: "bg-teal-50" },
  daif: { bar: "bg-amber-500", tint: "bg-amber-50" },
  mixed: { bar: "bg-zinc-400", tint: "bg-zinc-50" },
  no_fixed_hadith: { bar: "bg-slate-400", tint: "bg-slate-50" },
};

// The only top-level static route that had no explicit `metadata` export
// (about/privacy/contact/bookmarks/tools[tool] all already self-canonicalize) —
// without this, the homepage silently inherited the root layout's bare
// "PrayerFly" title/description with no <link rel="canonical"> at all.
export const metadata: Metadata = {
  // A plain string here would NOT pick up the root layout's "%s | PrayerFly"
  // template — Next.js only applies a layout's title template to deeper
  // segments, not to a page.tsx sharing the same segment as the layout that
  // defines it. Spelled out in full so the brand still shows in the tab/SERP.
  title: "أدعية وأذكار موثقة بإسناد صحيح | PrayerFly",
  description: truncateForMeta(
    "مكتبة أدعية وأذكار عربية موثقة من القرآن والسنة، بدرجة صحة كل حديث ومصدره الأصلي من الدرر السنية — أدعية السفر والاستخارة والمريض والميت، وأذكار الصباح والمساء والتحصين، وأكثر."
  ),
  alternates: { canonical: "/" },
};

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

      {/* 1. Hero — a full-bleed brand gradient rather than a white panel
          with a faint accent: PROJECT_PLAN.md's original "solid white
          everywhere, lime as a tiny accent" rule read as flat/dull once the
          real site was live next to warmer competitor sites (du3a.org's
          gold/brown palette, azkarna.com's bold saturated hero), so the
          hero specifically now carries real color — the rest of the site
          stays mostly white so this still reads as a deliberate accent
          moment, not a full repaint. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-400 px-6 pb-16 pt-20 text-center sm:pb-24 sm:pt-28">
        <GeometricPattern className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.08] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        {/* Soft glow shapes for depth — blurred, low-opacity, purely
            decorative; never sharp enough to compete with the foreground
            text/buttons for attention. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-secondary/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            {/* Solid white (not the translucent bg-white/15 this used
                before swapping in the real icon) — the icon's line art is a
                fixed brand dark-green raster, not a recolorable currentColor
                SVG, so it needs real contrast against the gradient, not a
                tint of it. */}
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-soft-lg">
              <Image src="/logo-icon.png" alt="" width={40} height={40} className="size-10" priority />
            </span>
            <div className="flex flex-col items-center gap-2">
              <span className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl">
                PrayerFly
              </span>
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-secondary" />
            </div>
          </div>
          <p className="font-sans text-lg text-white/85">أدعية موثقة بإسناد صحيح</p>

          <p className="font-naskh max-w-md text-2xl leading-loose text-white">
            بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/دعاء"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-primary-900 shadow-soft-lg transition-transform hover:-translate-y-0.5 hover:bg-secondary/90"
            >
              <Compass className="size-4" />
              تصفح الأدعية
            </Link>
            <a
              href="#search"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              ابحث عن دعاء
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/80">
            <span className="flex items-baseline gap-1.5">
              <span className="font-sans text-lg font-bold text-secondary">{totalDuas}+</span>
              دعاء موثق
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-sans text-lg font-bold text-secondary">{pillars.length}</span>
              بابًا وموضوعًا
            </span>
            <span className="flex items-baseline gap-1.5">
              <ShieldCheck className="size-4 text-secondary" />
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
            {pillars.slice(0, 12).map((pillar) => {
              const Icon = getPillarIcon(pillar.pillarSlug);
              return (
                <Link
                  key={pillar.pillarSlug}
                  href={`/دعاء/${pillar.pillarSlug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background p-4 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft-lg"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground group-hover:text-primary">
                      {pillar.pillarName}
                    </span>
                    <span className="text-sm text-foreground/50">
                      {pillar.children.length} {pillar.children.length === 1 ? "دعاء" : "أدعية"}
                    </span>
                  </div>
                </Link>
              );
            })}
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
            {featuredDuas.map((dua) => {
              const accent = GRADE_ACCENT[dua.authenticity_grade] ?? GRADE_ACCENT.mixed;
              return (
                <Link
                  key={dua.slug}
                  href={`/دعاء/${slugifyPillar(dua.pillar)}/${dua.slug}`}
                  className="group overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
                >
                  <div className={`h-1.5 w-full ${accent.bar}`} />
                  <div className={`flex h-full flex-col gap-3 p-5 ${accent.tint}`}>
                    <span className="font-sans font-semibold text-foreground group-hover:text-primary">
                      {dua.title}
                    </span>
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
                  </div>
                </Link>
              );
            })}
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
