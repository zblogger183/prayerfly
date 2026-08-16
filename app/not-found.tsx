import Link from "next/link";
import { Compass, Search } from "lucide-react";

// Next.js's file convention: renders in place of any unmatched route,
// site-wide. Without this file the whole RTL/Arabic site fell through to
// Next's own untranslated "404 / This page could not be found" — the one
// page on the site that wasn't in Arabic at all.
export default function NotFound() {
  return (
    <div dir="rtl" className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary-50 text-primary">
        <Search className="size-7" />
      </span>
      <h1 className="mb-3 font-sans text-2xl font-bold text-foreground">
        هذه الصفحة غير موجودة
      </h1>
      <p className="mb-8 text-foreground/70">
        الرابط الذي وصلت منه قد يكون قديمًا أو مكتوبًا بشكل غير صحيح. جرّب البحث عن الدعاء الذي
        تريده، أو تصفّح الأدعية من الصفحة الرئيسية.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Compass className="size-4" />
          الصفحة الرئيسية
        </Link>
        <Link
          href="/دعاء"
          className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium text-foreground/80 hover:border-primary/30 hover:text-primary"
        >
          تصفح كل الأدعية
        </Link>
      </div>
    </div>
  );
}
