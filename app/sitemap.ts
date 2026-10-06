import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/sitemap";

// Static file at build (required for the static export; harmless otherwise).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapEntries().map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
  }));
}
