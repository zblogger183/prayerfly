import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Plain data in, plain trail out — Sprint 5's breadcrumbSchema() builds the
 * BreadcrumbList JSON-LD from the same `items` shape, so this component
 * doesn't need to know anything about schema.org itself.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="مسار التصفح" className="text-sm text-foreground/60">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-foreground/80">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="rounded transition-colors hover:text-primary hover:underline">
                  {item.label}
                </Link>
              )}
              {!isLast && <span className="text-foreground/30">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
