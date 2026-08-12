import Link from "next/link";

const LINKS = [
  { label: "عن الموقع", href: "/عن-الموقع" },
  { label: "سياسة الخصوصية", href: "/سياسة-الخصوصية" },
  { label: "اتصل بنا", href: "/اتصل-بنا" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-primary py-8 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
        <span className="font-sans text-lg font-semibold tracking-tight text-white">
          PrayerFly
        </span>
        <nav aria-label="روابط الموقع">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-secondary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-white/70">
          © {new Date().getFullYear()} PrayerFly · أدعية موثقة بإسناد صحيح
        </p>
      </div>
    </footer>
  );
}
