import { getAdhkarCollection } from "@/lib/adhkar";
import { decodeSlug } from "@/lib/content";
import { truncateForMeta } from "@/lib/arabic";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion } = await params;
  const collection = getAdhkarCollection(decodeSlug(occasion));

  if (!collection) {
    return renderOgCard({ title: "PrayerFly" });
  }

  return renderOgCard({
    eyebrow: "أذكار",
    title: collection.title,
    subtitle: truncateForMeta(collection.quick_answer, 120),
  });
}
