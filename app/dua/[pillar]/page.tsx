import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedDuas } from "@/components/RelatedDuas";
import { getAllPillarHubs, getPillarHub } from "@/lib/content";

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
    description: `أدعية موثقة في باب ${hub.pillarName}`,
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

  const items = hub.children.map((entry) => ({
    title: entry.canonical_topic,
    slug: entry.slug,
    pillar: hub.pillarSlug,
  }));

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "دعاء", href: "/دعاء" },
          { label: hub.pillarName, href: `/دعاء/${hub.pillarSlug}` },
        ]}
      />

      <h1 className="mb-2 mt-3 font-sans text-3xl font-bold text-foreground">{hub.pillarName}</h1>
      <p className="mb-8 text-foreground/70">
        أدعية موثقة بإسناد صحيح في باب {hub.pillarName}، مع درجة الصحة والمصدر لكل دعاء.
      </p>

      <RelatedDuas items={items} />
    </div>
  );
}
