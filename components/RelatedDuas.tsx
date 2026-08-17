import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface RelatedDua {
  title: string;
  slug: string;
  pillar: string;
}

interface RelatedDuasProps {
  items: RelatedDua[];
}

export function RelatedDuas({ items }: RelatedDuasProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/دعاء/${item.pillar}/${item.slug}`}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-background p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft-lg"
        >
          <span className="font-medium text-foreground group-hover:text-primary">{item.title}</span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary transition-transform group-hover:-translate-x-0.5">
            <ArrowLeft className="size-3.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
