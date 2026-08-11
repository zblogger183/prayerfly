import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AdSlot } from "@/components/AdSlot";
import { AudioPlayer } from "@/components/AudioPlayer";
import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopyButton } from "@/components/CopyButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import { RelatedDuas } from "@/components/RelatedDuas";
import { ShareImageButton } from "@/components/ShareImageButton";
import { TOC } from "@/components/TOC";

import sampleDua from "@/content/duas/دعاء-السفر-مكتوب.json";
import { TashkeelDemo } from "./TashkeelDemo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-b border-foreground/10 py-8 first:pt-0">
      <h2 className="font-sans text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export default function DevComponentsPage() {
  // Dev-only route: not part of content-plan.json, so Sprint 8's sitemap
  // (driven off that file) won't ever pick it up — this gate additionally
  // makes it unreachable outright once deployed to production.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 font-sans text-2xl font-bold text-foreground">
        معرض المكوّنات (Sprint 3)
      </h1>
      <p className="mb-8 text-sm text-foreground/60">
        صفحة للتطوير فقط — كل مكوّن معروض بمعزل عن غيره ببيانات تجريبية، قبل دمجه في قالب الصفحة
        الفعلي (Sprint 4).
      </p>

      <Section title="DuaText + TashkeelToggle">
        <TashkeelDemo text={sampleDua.arabic_text_tashkeel} />
      </Section>

      <Section title="AuthenticityBadge">
        <AuthenticityBadge grade="sahih" narrator="عبد الله بن عمر رضي الله عنهما" source="صحيح مسلم، رقم 1342" />
        <AuthenticityBadge grade="hasan" narrator="أبو هريرة رضي الله عنه" source="سنن الترمذي" />
        <AuthenticityBadge grade="daif" source="مصدر غير موثق" />
        <AuthenticityBadge grade="mixed" source="روايات متعددة بأسانيد متفاوتة" />
      </Section>

      <Section title="AudioPlayer">
        <AudioPlayer audioUrl="https://example.com/audio/dua-safar.mp3" />
        <div className="text-xs text-foreground/50">
          بدون audio_url (لا يجب أن يظهر شيء) ⟶ <AudioPlayer />
        </div>
      </Section>

      <Section title="CopyButton">
        <CopyButton text={sampleDua.arabic_text_plain} />
      </Section>

      <Section title="ShareImageButton">
        <ShareImageButton
          text={sampleDua.arabic_text_plain}
          title={sampleDua.title}
          fileName={sampleDua.slug}
        />
      </Section>

      <Section title="BookmarkButton">
        <BookmarkButton slug={sampleDua.slug} />
      </Section>

      <Section title="AdSlot">
        <AdSlot size="rectangle" />
        <AdSlot size="banner" />
      </Section>

      <Section title="Breadcrumbs">
        <Breadcrumbs
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "دعاء", href: "/دعاء" },
            { label: sampleDua.pillar, href: `/دعاء/${sampleDua.pillar}` },
            { label: sampleDua.title, href: `/دعاء/${sampleDua.pillar}/${sampleDua.slug}` },
          ]}
        />
      </Section>

      <Section title="TOC">
        <TOC
          items={[
            { id: "authenticity", label: "درجة الصحة" },
            { id: "when", label: "متى وكم مرة تُقال" },
            { id: "ruling", label: "الحكم والسياق" },
            { id: "faq", label: "الأسئلة الشائعة" },
            { id: "related", label: "أدعية ذات صلة" },
          ]}
        />
      </Section>

      <Section title="FaqAccordion">
        <div className="w-full">
          <FaqAccordion items={sampleDua.faq} />
        </div>
      </Section>

      <Section title="RelatedDuas">
        <div className="w-full">
          <RelatedDuas
            items={[
              { title: "دعاء الاستخارة", slug: "دعاء-الاستخارة", pillar: "الاستخارة" },
              { title: "دعاء المطر", slug: "دعاء-المطر", pillar: "المطر-والطبيعة" },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
