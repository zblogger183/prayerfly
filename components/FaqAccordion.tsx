export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

/**
 * Native <details>/<summary> instead of a useState-driven accordion: it's
 * expand/collapse behavior the browser already provides for free, fully
 * server-rendered (no "use client", no hydration cost), and accessible by
 * default. FAQPage JSON-LD built from this same `items` array is Sprint 5's
 * job (lib/schema.ts's faqSchema()), not this component's.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-foreground/10 rounded-lg border border-foreground/10">
      {items.map((item, i) => (
        <details key={i} className="group p-4">
          <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none">
            <span className="flex items-center justify-between gap-4">
              {item.q}
              <span className="shrink-0 text-foreground/40 transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
