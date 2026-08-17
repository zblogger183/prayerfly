import type { LucideIcon } from "lucide-react";

interface SectionHeadingProps {
  icon: LucideIcon;
  children: React.ReactNode;
}

/**
 * Every content-page section (دعاء, أذكار, دليل) used a bare text <h2> —
 * fine semantically, but visually indistinguishable from a paragraph next
 * to the redesigned hero/cards elsewhere on the site. A small icon badge
 * per section (same bg-primary-50/text-primary language as the pillar
 * cards) gives the reading page some of the same visual interest without
 * touching font size/weight, which stays exactly as before.
 */
export function SectionHeading({ icon: Icon, children }: SectionHeadingProps) {
  return (
    <h2 className="flex items-center gap-2.5 font-sans text-lg font-semibold text-primary">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
        <Icon className="size-4" />
      </span>
      {children}
    </h2>
  );
}
