import type { Metadata } from "next";
import { Mail, PenLine } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

const canonicalPath = "/اتصل-بنا";
const CONTACT_EMAIL = "contact@prayerfly.com";
const CORRECTIONS_EMAIL = "corrections@prayerfly.com";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل مع فريق PrayerFly.",
  alternates: { canonical: canonicalPath },
};

export default function ContactPage() {
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "اتصل بنا", href: canonicalPath },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-6 mt-3 font-sans text-3xl font-bold text-foreground">اتصل بنا</h1>

      <div className="space-y-4">
        <div className="flex items-start gap-4 rounded-xl border border-foreground/10 bg-surface p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="mb-1 font-medium text-foreground">استفسار أو ملاحظة عامة</p>
            <p className="mb-2 text-sm text-foreground/70">لأي استفسار أو ملاحظة عامة حول الموقع، راسلنا مباشرة.</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-medium text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-foreground/10 bg-surface p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
            <PenLine className="size-5" />
          </span>
          <div>
            <p className="mb-1 font-medium text-foreground">تصحيح خطأ في نص أو تخريج</p>
            <p className="mb-2 text-sm text-foreground/70">
              الأفضل استخدام رابط &quot;أبلغ عن خطأ&quot; أسفل صفحة الدعاء نفسها — يصل تلقائيًا مع رابط
              الصفحة، أو راسلنا مباشرة.
            </p>
            <a href={`mailto:${CORRECTIONS_EMAIL}`} className="text-sm font-medium text-primary hover:underline">
              {CORRECTIONS_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
