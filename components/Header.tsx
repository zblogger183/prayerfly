import Link from "next/link";
import { Suspense } from "react";
import { HomeSearch, HomeSearchWithQuery } from "@/components/HomeSearch";
import { getSearchIndex } from "@/lib/search-index";

/**
 * Site-wide, rendered once in the root layout — every page pays the (cheap,
 * ISR-cached) cost of getSearchIndex() so the header search box works from
 * anywhere, not just the homepage. "تصفح الأدعية" points at /#pillars: the
 * homepage's pillar grid is the only real browse-all-pillars surface that
 * exists (there's no standalone /دعاء index route — see the dead-breadcrumb
 * fix this same sprint), so that's genuinely where it should go rather than
 * a route that doesn't exist yet.
 */
export function Header() {
  const index = getSearchIndex();

  return (
    <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-sans text-xl font-semibold tracking-tight text-primary"
        >
          PrayerFly
        </Link>

        <nav aria-label="التنقل الرئيسي" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/#pillars"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            تصفح الأدعية
          </Link>
          <Suspense fallback={<HomeSearch index={index} compact />}>
            <HomeSearchWithQuery index={index} compact />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
