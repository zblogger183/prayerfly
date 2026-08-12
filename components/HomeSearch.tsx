"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { normalizeForSearch } from "@/lib/arabic";
import type { SearchIndexItem } from "@/lib/search-index";

const MAX_RESULTS = 8;

/**
 * Pure, prop-driven — no hooks that force a client-render bailout. Used
 * directly as the fallback passed to `<Suspense>` in page.tsx (a fallback
 * that itself called useSearchParams would defeat the point: Next requires
 * the fallback to be renderable without it) and internally by
 * HomeSearchWithQuery below.
 */
export function HomeSearch({
  index,
  initialQuery = "",
  compact = false,
}: {
  index: SearchIndexItem[];
  initialQuery?: string;
  /** Header form: smaller footprint, results float over page content instead of pushing it down. */
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return [];
    return index
      .filter((item) => normalizeForSearch(item.keywords).includes(q))
      .slice(0, MAX_RESULTS);
  }, [query, index]);

  return (
    <div className={compact ? "relative w-28 sm:w-44 md:w-56" : "w-full max-w-lg"}>
      <label className="relative block">
        <Search
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 ${compact ? "size-4" : "size-5"}`}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن دعاء..."
          dir="rtl"
          className={`w-full rounded-full border border-foreground/15 bg-background text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-secondary/40 ${
            compact ? "py-1.5 pr-9 pl-3 text-sm" : "rounded-xl py-3 pr-10 pl-4 text-base"
          }`}
        />
      </label>

      {query.trim() && (
        <div
          className={`overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-lg ${
            compact ? "absolute top-full mt-1.5 w-72 max-w-[80vw]" : "mt-2"
          }`}
          style={compact ? { insetInlineEnd: 0 } : undefined}
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-foreground/10 text-right">
              {results.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 transition-colors hover:bg-foreground/5"
                  >
                    <span className="block font-medium text-foreground">{item.title}</span>
                    <span className="mt-0.5 block truncate text-sm text-foreground/60">
                      {item.quick_answer}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-foreground/60">لا توجد نتائج مطابقة.</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Reads `?q=` (the SearchAction target) via useSearchParams rather than a
 * server-passed prop — Sprint 10 finding: awaiting `searchParams` in the
 * page component itself dropped next/font's `<link rel="preload">` tags
 * for the whole route (measured with Lighthouse: the font became a 3rd-
 * level network-dependency-chain fetch instead of a parallel preload,
 * ~3.3s down the critical path). Reading it here instead keeps page.tsx's
 * server render fully static; only this component's Suspense boundary
 * opts into a client-side render for the query itself.
 */
export function HomeSearchWithQuery({
  index,
  compact = false,
}: {
  index: SearchIndexItem[];
  compact?: boolean;
}) {
  const searchParams = useSearchParams();
  return <HomeSearch index={index} initialQuery={searchParams.get("q") ?? ""} compact={compact} />;
}
