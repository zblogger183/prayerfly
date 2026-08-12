import type { Metadata } from "next";

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

      <div className="space-y-6 text-foreground/85">
        <p>
          لأي استفسار أو ملاحظة عامة حول الموقع، راسلنا مباشرة على:
          <br />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>

        <p>
          لتصحيح خطأ في نص دعاء أو تخريجه تحديدًا، الأفضل استخدام رابط "أبلغ عن خطأ" أسفل الصفحة
          نفسها — يصل تلقائيًا مع رابط الصفحة إلى:
          <br />
          <a
            href={`mailto:${CORRECTIONS_EMAIL}`}
            className="font-medium text-primary hover:underline"
          >
            {CORRECTIONS_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
