import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RelatedDuas } from "@/components/RelatedDuas";
import { truncateForMeta, truncateForTitle } from "@/lib/arabic";
import { getAllPillarHubs, getPillarHub } from "@/lib/content";
import { PillarIcon } from "@/lib/pillar-style";
import { absoluteUrl, breadcrumbSchema } from "@/lib/schema";

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

  const description = truncateForMeta(hub.description ?? `أدعية موثقة بإسناد صحيح في باب ${hub.pillarName}، مع درجة الصحة والمصدر لكل دعاء.`);
  const canonicalPath = `/دعاء/${hub.pillarSlug}`;

  return {
    title: truncateForTitle(hub.pillarName),
    description,
    alternates: { canonical: canonicalPath },
    // Previously absent entirely, so Next auto-filled og:image from this
    // route's physical ASCII path (app/dua/[pillar]/opengraph-image.tsx) —
    // same leak as the dua-page fix, explicit here for the same reason.
    openGraph: {
      title: hub.pillarName,
      description,
      url: canonicalPath,
      type: "website",
      locale: "ar_AR",
      images: [absoluteUrl(`${canonicalPath}/opengraph-image`)],
    },
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
    <div dir="rtl" className="mx-auto w-full max-w-5xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-6 mt-3 flex flex-wrap items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          <PillarIcon pillarSlug={hub.pillarSlug} className="size-7" />
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-sans text-3xl font-bold text-primary">{hub.pillarName}</h1>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
            {items.length === 1 ? "دعاء واحد" : `${items.length} أدعية`}
          </span>
        </div>
      </div>

      {hub.introMarkdown ? (
        <div className="prose prose-sm mb-8 max-w-3xl text-foreground/85">
          <MDXRemote source={hub.introMarkdown} />
        </div>
      ) : (
        <p className="mb-8 max-w-3xl text-foreground/70">
          أدعية موثقة بإسناد صحيح في باب {hub.pillarName}، مع درجة الصحة والمصدر لكل دعاء.
        </p>
      )}

      <RelatedDuas items={items} />
    </div>
  );
}
