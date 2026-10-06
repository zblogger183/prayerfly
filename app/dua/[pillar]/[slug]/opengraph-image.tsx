import { getDua } from "@/lib/content";
import { truncateForMeta } from "@/lib/arabic";
import { OG_CONTENT_TYPE, OG_SIZE, gradeLabel, renderOgCard } from "@/lib/og-image";

// Prerendered at build (static export on Cloudflare needs every route
// enumerated); params come from the sibling page so the two never drift.
export { generateStaticParams } from "./page";
export const dynamic = "force-static";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { slug } = await params;
  const dua = getDua(slug);

  if (!dua) {
    return renderOgCard({ title: "PrayerFly" });
  }

  return renderOgCard({
    eyebrow: gradeLabel(dua.authenticity_grade),
    title: dua.primary_keyword,
    subtitle: truncateForMeta(dua.quick_answer, 120),
  });
}
