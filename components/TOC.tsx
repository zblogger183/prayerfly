export interface TOCItem {
  id: string;
  label: string;
}

interface TOCProps {
  items: TOCItem[];
}

/**
 * Takes a fixed list of {id, label} rather than scanning the DOM for <h2>s
 * at runtime: the page template's block order (PROJECT_PLAN.md Section 5)
 * is already known ahead of time, so Sprint 4 can build this list directly
 * instead of a client-side DOM query — that avoids a "use client" + effect
 * just to read headings that were static all along, and sidesteps content
 * flashing in before the TOC populates.
 */
export function TOC({ items }: TOCProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="محتويات الصفحة" className="rounded-lg border border-foreground/10 p-4 text-sm">
      <p className="mb-2 font-medium text-foreground/80">في هذه الصفحة</p>
      <ol className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-foreground/60 hover:text-primary hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
