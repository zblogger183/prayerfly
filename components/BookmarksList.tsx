"use client";

import Link from "next/link";
import { BookmarkX } from "lucide-react";
import { useBookmarkedSlugs } from "@/components/BookmarkButton";
import type { SearchIndexItem } from "@/lib/search-index";

export function BookmarksList({ index }: { index: SearchIndexItem[] }) {
  const bookmarkedSlugs = useBookmarkedSlugs();
  const bookmarked = index.filter((item) => bookmarkedSlugs.includes(item.slug));

  if (bookmarked.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-foreground/20 p-10 text-center text-foreground/70">
        <BookmarkX className="size-8 text-foreground/30" />
        <p className="font-medium text-foreground">لم تحفظ أي دعاء بعد.</p>
        <p className="text-sm">
          اضغط على زر &quot;احفظ&quot; أسفل أي دعاء لإضافته هنا، وستبقى المفضّلة محفوظة على هذا الجهاز.
        </p>
        <Link
          href="/"
          className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
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
            className="block rounded-xl border border-foreground/10 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
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
