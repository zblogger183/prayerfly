import { getDua } from "@/lib/content";
import { truncateForMeta } from "@/lib/arabic";
import { OG_CONTENT_TYPE, OG_SIZE, gradeLabel, renderOgCard } from "@/lib/og-image";

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
