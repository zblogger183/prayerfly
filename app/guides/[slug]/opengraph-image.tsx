import { decodeSlug } from "@/lib/content";
import { getGuide } from "@/lib/guides";
import { truncateForMeta } from "@/lib/arabic";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(decodeSlug(slug));

  if (!guide) {
    return renderOgCard({ title: "PrayerFly" });
  }

  return renderOgCard({
    eyebrow: "دليل خطوات",
    title: guide.title,
    subtitle: truncateForMeta(guide.quick_answer, 120),
  });
}
