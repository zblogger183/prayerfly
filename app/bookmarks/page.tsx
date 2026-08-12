import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BookmarksList } from "@/components/BookmarksList";
import { getSearchIndex } from "@/lib/search-index";

// Physically lives at /bookmarks (ASCII), same reason as every route since
// Sprint 4. proxy.ts rewrites the real "/محفوظاتي" public URL here.
// noindex: this page's content is per-visitor localStorage state, nothing
// here is the same between two crawls of the same URL.

const canonicalPath = "/محفوظاتي";

export const metadata: Metadata = {
  title: "محفوظاتي",
  description: "الأدعية التي حفظتها للرجوع إليها لاحقًا.",
  alternates: { canonical: canonicalPath },
  robots: { index: false, follow: true },
};

export default function BookmarksPage() {
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "محفوظاتي", href: canonicalPath },
  ];

  const index = getSearchIndex();

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-6 mt-3 font-sans text-3xl font-bold text-foreground">محفوظاتي</h1>

      <BookmarksList index={index} />
    </div>
  );
}
