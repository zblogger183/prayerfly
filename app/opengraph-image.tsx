import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Site-wide fallback — Next.js inherits this for every route segment that
// doesn't define its own more specific opengraph-image.tsx (homepage,
// about/privacy/contact/bookmarks, tool pages, dev/components).
export default async function Image() {
  return renderOgCard({
    title: "أدعية وأذكار موثقة بإسناد صحيح",
    subtitle: "مكتبة أدعية وأذكار عربية موثقة من القرآن والسنة، بدرجة صحة كل حديث ومصدره الأصلي",
  });
}
