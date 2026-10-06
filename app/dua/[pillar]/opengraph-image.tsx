import { getPillarHub } from "@/lib/content";
import { truncateForMeta } from "@/lib/arabic";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image";

// Prerendered at build (static export on Cloudflare needs every route
// enumerated); params come from the sibling page so the two never drift.
export { generateStaticParams } from "./page";
export const dynamic = "force-static";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  const hub = getPillarHub(pillar);

  if (!hub) {
    return renderOgCard({ title: "PrayerFly" });
  }

  return renderOgCard({
    eyebrow: "باب",
    title: hub.pillarName,
    subtitle: hub.description ? truncateForMeta(hub.description, 120) : undefined,
  });
}
