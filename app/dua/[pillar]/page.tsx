import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RelatedDuas } from "@/components/RelatedDuas";
import { getAllPillarHubs, getPillarHub } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

export const revalidate = 604800; // weekly ISR

export async function generateStaticParams() {
  return getAllPillarHubs().map((hub) => ({ pillar: hub.pillarSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar } = await params;
  const hub = getPillarHub(pillar);
  if (!hub) return {};

  return {
    title: hub.pillarName,
    description: hub.description ?? `أدعية موثقة في باب ${hub.pillarName}`,
    alternates: { canonical: `/دعاء/${hub.pillarSlug}` },
  };
}

export default async function PillarHubPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const hub = getPillarHub(pillar);
  if (!hub) notFound();

  const items = hub.children.map((child) => ({
    title: child.title,
    slug: child.slug,
    pillar: hub.pillarSlug,
  }));

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: hub.pillarName, href: `/دعاء/${hub.pillarSlug}` },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-2 mt-3 font-sans text-3xl font-bold text-primary">{hub.pillarName}</h1>

      {hub.introMarkdown ? (
        <div className="prose prose-sm mb-8 max-w-none text-foreground/85">
          <MDXRemote source={hub.introMarkdown} />
        </div>
      ) : (
        <p className="mb-8 text-foreground/70">
          أدعية موثقة بإسناد صحيح في باب {hub.pillarName}، مع درجة الصحة والمصدر لكل دعاء.
        </p>
      )}

      <RelatedDuas items={items} />
    </div>
  );
}
