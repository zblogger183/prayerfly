import Image from "next/image";
import Link from "next/link";

const BROWSE_LINKS = [
  { label: "تصفح الأدعية", href: "/دعاء" },
  { label: "الأذكار", href: "/اذكار/صباح" },
  { label: "الأدلة", href: "/خطوات/خطوات-العمرة" },
  { label: "الأدوات", href: "/ادوات/دعاء-لشخص" },
];

const ABOUT_LINKS = [
  { label: "عن الموقع", href: "/عن-الموقع" },
  { label: "سياسة الخصوصية", href: "/سياسة-الخصوصية" },
  { label: "اتصل بنا", href: "/اتصل-بنا" },
  { label: "محفوظاتي", href: "/محفوظاتي" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-primary text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-3">
            <Link href="/" className="flex items-center gap-2">
              {/* The icon's own line art is a fixed brand dark-green (a
                  raster mark, not a currentColor SVG) — it would vanish
                  against this footer's solid green background without a
                  light badge behind it, same reasoning as the OG-image
                  card's icon treatment. */}
              <span className="flex size-8 items-center justify-center rounded-full bg-white">
                <Image src="/logo-icon.png" alt="" width={20} height={20} className="size-5" />
              </span>
              <span className="font-sans text-lg font-semibold tracking-tight text-white">
                PrayerFly
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              أدعية وأذكار موثقة بإسناد صحيح، مع بيان درجة الصحة والمصدر لكل نص قبل أن تقرأه.
            </p>
          </div>

          <nav aria-label="روابط التصفح">
            <p className="mb-3 text-sm font-semibold text-white/50">التصفح</p>
            <ul className="flex flex-col gap-2.5 text-sm text-white/80">
              {BROWSE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-secondary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="روابط الموقع">
            <p className="mb-3 text-sm font-semibold text-white/50">الموقع</p>
            <ul className="flex flex-col gap-2.5 text-sm text-white/80">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-secondary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/15 pt-6 text-center sm:flex-row sm:justify-between sm:text-right">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} PrayerFly · جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-white/60">أدعية موثقة بإسناد صحيح</p>
        </div>
      </div>
    </footer>
  );
}
