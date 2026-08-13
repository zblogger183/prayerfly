import type { Metadata } from "next";
import { BarChart3, Bookmark, Lock, Mail, Server } from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

const canonicalPath = "/سياسة-الخصوصية";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "ما الذي يجمعه PrayerFly من بيانات، وما الذي لا يجمعه.",
  alternates: { canonical: canonicalPath },
};

export default function PrivacyPage() {
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "سياسة الخصوصية", href: canonicalPath },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-6 mt-3 flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
          <Lock className="size-5" />
        </span>
        <h1 className="font-sans text-3xl font-bold text-foreground">سياسة الخصوصية</h1>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/85">
        <p className="rounded-xl border border-primary-100 bg-primary-50/50 p-5 text-foreground/85">
          PrayerFly (الجهة المسؤولة عن البيانات) لا يطلب من الزائر إنشاء حساب ولا تسجيل دخول،
          ولذلك فإن ما يُجمع من بيانات محدود جدًا. هذه الصفحة تشرح بالضبط ما يحدث.
        </p>

        <section>
          <h2 className="mb-2 flex items-center gap-2.5 font-sans text-lg font-semibold text-foreground">
            <Bookmark className="size-[18px] shrink-0 text-primary" />
            المفضّلة (Bookmarks)
          </h2>
          <p>
            عند الضغط على زر الحفظ في أي صفحة دعاء، يُخزَّن رابط الصفحة في متصفحك فقط
            (localStorage)، ولا يُرسَل إلى أي خادم ولا يُربط باسمك أو بريدك. حذف بيانات المتصفح
            يمسح هذه القائمة نهائيًا، ولا توجد نسخة منها لدينا.
          </p>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-2.5 font-sans text-lg font-semibold text-foreground">
            <BarChart3 className="size-[18px] shrink-0 text-primary" />
            التحليلات والإعلانات
          </h2>
          <p>
            لا تعمل على الموقع حاليًا أي أداة تحليلات أو إعلانات. عند تفعيل إعلانات Google
            AdSense مستقبلاً، ستُستخدم ملفات تعريف الارتباط (cookies) الخاصة بـ AdSense لعرض
            إعلانات مناسبة، ويمكنك التحكم في تفضيلات الإعلانات عبر{" "}
            <a
              href="https://myadcenter.google.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary hover:underline"
            >
              إعدادات إعلانات Google
            </a>
            . سنحدّث هذه الصفحة فور تفعيل أي أداة تحليلات أو إعلانات فعليًا، لا قبل ذلك.
          </p>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-2.5 font-sans text-lg font-semibold text-foreground">
            <Server className="size-[18px] shrink-0 text-primary" />
            بيانات الخادم الأساسية
          </h2>
          <p>
            كأي موقع، قد تُسجَّل بيانات تقنية أساسية (عنوان IP، نوع المتصفح، الصفحة المطلوبة)
            تلقائيًا من مزوّد الاستضافة لأغراض تشغيل الموقع وأمنه، دون ربطها بهوية الزائر.
          </p>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-2.5 font-sans text-lg font-semibold text-foreground">
            <Mail className="size-[18px] shrink-0 text-primary" />
            تواصل معنا
          </h2>
          <p>
            لأي استفسار حول هذه السياسة، راجع صفحة{" "}
            <a href="/اتصل-بنا" className="text-primary hover:underline">
              اتصل بنا
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
