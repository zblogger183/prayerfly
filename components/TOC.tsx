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
    <nav
      aria-label="محتويات الصفحة"
      className="rounded-xl border border-foreground/10 bg-surface p-4 text-sm"
    >
      <p className="mb-3 text-xs font-semibold tracking-wide text-foreground/40">في هذه الصفحة</p>
      <ol className="space-y-0.5 border-e-2 border-foreground/10">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-me-0.5 block border-e-2 border-transparent px-3 py-1.5 text-foreground/60 transition-colors hover:border-primary hover:text-primary"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
