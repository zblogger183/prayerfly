import Link from "next/link";

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
          className="rounded-xl border border-foreground/10 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
        >
          <span className="block font-medium text-foreground">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
