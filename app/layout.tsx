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

export const metadata: Metadata = {
  metadataBase: new URL("https://prayerfly.com"),
  title: {
    default: "PrayerFly",
    template: "%s | PrayerFly",
  },
  description: "أدعية موثقة بإسناد صحيح",
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
