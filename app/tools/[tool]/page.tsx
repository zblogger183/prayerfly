import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RelationshipDuaFinder } from "@/components/RelationshipDuaFinder";
import { decodeSlug } from "@/lib/content";
import { getFinderMatrix, occasions, relationships } from "@/lib/relationship-finder";
import { breadcrumbSchema } from "@/lib/schema";

// Physically lives at /tools/[tool] (ASCII), same reason as every route
// since Sprint 4. proxy.ts rewrites the real "/ادوات/..." public URL here.
// Only one tool exists today ("دعاء-لشخص"); this stays a dynamic route
// (rather than a fixed /tools/relationship-finder/ folder) so adding the
// Istikhara tool later (Section 4.1) is a new case here, not a new route
// shape.

const TOOL_SLUG = "دعاء-لشخص";

export async function generateStaticParams() {
  return [{ tool: TOOL_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  if (decodeSlug(tool) !== TOOL_SLUG) return {};

  const canonicalPath = `/ادوات/${TOOL_SLUG}`;
  return {
    title: "دعاء لشخص",
    description: "اختر قرابتك من الشخص والمناسبة، واحصل على الدعاء المناسب الثابت له.",
    alternates: { canonical: canonicalPath },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  if (decodeSlug(tool) !== TOOL_SLUG) notFound();

  const canonicalPath = `/ادوات/${TOOL_SLUG}`;
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "دعاء لشخص", href: canonicalPath },
  ];

  const matrix = getFinderMatrix();

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-4 mt-3 font-sans text-3xl font-bold text-primary">دعاء لشخص</h1>
      <div className="mb-8 rounded-xl border border-primary-100 bg-primary-50/50 p-5">
        <p className="text-base leading-relaxed text-foreground/85">
          اختر قرابتك من الشخص والمناسبة، لتحصل مباشرة على الدعاء الثابت المناسب له.
        </p>
      </div>

      <RelationshipDuaFinder relationships={relationships} occasions={occasions} matrix={matrix} />
    </div>
  );
}
