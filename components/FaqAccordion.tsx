import { ChevronDown } from "lucide-react";

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
    <div className="divide-y divide-foreground/10 overflow-hidden rounded-xl border border-foreground/10">
      {items.map((item, i) => (
        <details key={i} className="group bg-background open:bg-surface">
          <summary className="cursor-pointer list-none px-4 py-3.5 font-medium text-foreground marker:content-none">
            <span className="flex items-center justify-between gap-4">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-foreground/40 transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <p className="px-4 pb-4 text-sm leading-relaxed text-foreground/70">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
