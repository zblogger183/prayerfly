import Link from "next/link";
import { Suspense } from "react";
import { Bookmark } from "lucide-react";
import { HomeSearch, HomeSearchWithQuery } from "@/components/HomeSearch";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { getSearchIndex } from "@/lib/search-index";

/**
 * Real destinations for every nav item — no placeholder "#" links. Azkar,
 * guides, and tools don't have index pages yet (each currently has exactly
 * one built collection/guide/tool), so those items link straight to the
 * one real page rather than to a browse page that doesn't exist; "تصفح
 * الأدعية" now points at the real /دعاء pillar index instead of the old
 * /#pillars in-page anchor, since that index route exists now.
 */
const NAV_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "تصفح الأدعية", href: "/دعاء" },
  { label: "الأذكار", href: "/اذكار/صباح" },
  { label: "الأدلة", href: "/خطوات/خطوات-العمرة" },
  { label: "الأدوات", href: "/ادوات/دعاء-لشخص" },
  { label: "عن الموقع", href: "/عن-الموقع" },
];

/**
 * Site-wide, rendered once in the root layout — every page pays the (cheap,
 * ISR-cached) cost of getSearchIndex() so the header search box works from
 * anywhere, not just the homepage.
 */
export function Header() {
  const index = getSearchIndex();

  return (
    <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo className="size-7 text-primary" />
          <span className="font-sans text-xl font-semibold tracking-tight text-primary">
            PrayerFly
          </span>
        </Link>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary-50 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Suspense fallback={<HomeSearch index={index} compact />}>
            <HomeSearchWithQuery index={index} compact />
          </Suspense>
          <Link
            href="/محفوظاتي"
            aria-label="محفوظاتي"
            className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-primary-50 hover:text-primary sm:inline-flex"
          >
            <Bookmark className="size-[18px]" />
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
