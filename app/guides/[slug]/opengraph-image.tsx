import { decodeSlug } from "@/lib/content";
import { getGuide } from "@/lib/guides";
import { truncateForMeta } from "@/lib/arabic";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image";

// Prerendered at build (static export on Cloudflare needs every route
// enumerated); params come from the sibling page so the two never drift.
export { generateStaticParams } from "./page";
export const dynamic = "force-static";

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
