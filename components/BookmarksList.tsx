"use client";

import Link from "next/link";
import { useBookmarkedSlugs } from "@/components/BookmarkButton";
import type { SearchIndexItem } from "@/lib/search-index";

export function BookmarksList({ index }: { index: SearchIndexItem[] }) {
  const bookmarkedSlugs = useBookmarkedSlugs();
  const bookmarked = index.filter((item) => bookmarkedSlugs.includes(item.slug));

  if (bookmarked.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-foreground/20 p-8 text-center text-foreground/70">
        <p>لم تحفظ أي دعاء بعد.</p>
        <p className="mt-1 text-sm">
          اضغط على زر "احفظ" أسفل أي دعاء لإضافته هنا، وستبقى المفضّلة محفوظة على هذا الجهاز.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          تصفح الأدعية من الصفحة الرئيسية ←
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {bookmarked.map((item) => (
        <li key={item.slug}>
          <Link
            href={item.href}
            className="block rounded-lg border border-foreground/10 p-4 transition-colors hover:border-foreground/25 hover:bg-foreground/[0.03]"
          >
            <span className="block font-medium text-foreground">{item.title}</span>
            <span className="mt-0.5 block truncate text-sm text-foreground/60">
              {item.quick_answer}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
