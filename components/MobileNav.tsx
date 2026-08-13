"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

/**
 * Client boundary for the header's mobile drawer only — Header itself stays
 * a server component (it already pays for getSearchIndex() there). Closes
 * on route change is handled implicitly: Link navigation unmounts nothing
 * here, so we also close on Escape and on backdrop click, and lock body
 * scroll while open so the page behind the overlay doesn't scroll with it.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح قائمة التصفح"
        aria-expanded={open}
        className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-primary md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col gap-1 bg-background p-4 shadow-soft-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/50">التصفح</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="inline-flex size-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/5 hover:text-primary"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="التنقل الرئيسي">
              <ul className="flex flex-col gap-0.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 font-medium text-foreground/80 transition-colors hover:bg-primary-50 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
