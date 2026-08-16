import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RelatedDuas } from "@/components/RelatedDuas";
import { truncateForMeta, truncateForTitle } from "@/lib/arabic";
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
    title: truncateForTitle(hub.pillarName),
    description: truncateForMeta(hub.description ?? `أدعية موثقة بإسناد صحيح في باب ${hub.pillarName}، مع درجة الصحة والمصدر لكل دعاء.`),
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

      <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-sans text-3xl font-bold text-primary">{hub.pillarName}</h1>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
          {items.length === 1 ? "دعاء واحد" : `${items.length} أدعية`}
        </span>
      </div>

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
