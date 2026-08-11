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
          className="rounded-lg border border-foreground/10 p-4 transition-colors hover:border-foreground/25 hover:bg-foreground/[0.03]"
        >
          <span className="block font-medium text-foreground">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
