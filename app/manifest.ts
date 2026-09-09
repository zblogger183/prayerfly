import type { MetadataRoute } from "next";

// Icons point at the existing app/icon.png + app/apple-icon.png file-
// convention routes (already serving /icon.png and /apple-icon.png) rather
// than duplicating those assets — no new files needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrayerFly — أدعية وأذكار موثقة بإسناد صحيح",
    short_name: "PrayerFly",
    description: "مكتبة أدعية وأذكار عربية موثقة من القرآن والسنة، بدرجة صحة كل حديث ومصدره الأصلي.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1c4b42",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icon.png", sizes: "1000x1000", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
