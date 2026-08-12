import type { Metadata } from "next";
import { Noto_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

// UI chrome (nav, buttons, body copy) — Arabic + Latin (for the "PrayerFly" wordmark and numerals)
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-sans-arabic",
  subsets: ["arabic", "latin"],
});

// Dua/Qur'anic text only — chosen for clean tashkeel rendering at small sizes
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
});

// Same env-var gate as app/robots.ts, defaulting to blocked. A page's own
// per-page `robots: { index: false, ... }` (e.g. guarded/synthetic
// entries) still applies independently once this global block lifts —
// Next's metadata merging only fills this in where a route doesn't
// already set its own `robots` field.
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const metadata: Metadata = {
  metadataBase: new URL("https://prayerfly.com"),
  title: {
    default: "PrayerFly",
    template: "%s | PrayerFly",
  },
  description: "أدعية موثقة بإسناد صحيح",
  ...(allowIndexing ? {} : { robots: { index: false, follow: false } }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoSansArabic.variable} ${notoNaskhArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
