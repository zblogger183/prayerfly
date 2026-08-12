import type { Dua } from "@/lib/schema";

type Grade = Dua["authenticity_grade"];

const GRADE_STYLES: Record<Grade, { label: string; className: string }> = {
  // The one grade allowed to carry brand color (PROJECT_PLAN.md Section 8):
  // solid primary fill, white text.
  sahih: { label: "صحيح", className: "border-primary bg-primary text-white" },
  // Deliberately NOT brand green or amber — hasan needs to stay visually
  // distinct from both "the on-brand best case" (sahih) and "the warning
  // case" (daif), so a citation's grade never reads as brand styling.
  hasan: { label: "حسن", className: "bg-teal-100 text-teal-800 border-teal-300" },
  // Amber regardless of the brand palette — a weak grade should never look
  // like a positive, on-brand result by borrowing primary/secondary.
  daif: { label: "ضعيف", className: "bg-amber-100 text-amber-800 border-amber-300" },
  mixed: { label: "متفاوت", className: "bg-zinc-100 text-zinc-700 border-zinc-300" },
  // Not a hadith grade at all — e.g. دعاء ختم القرآن, a scholarly-compiled
  // or companion-practice text with no single fixed prophetic wording.
  // Slate rather than mixed's zinc so it doesn't read as "just another
  // shade of gray" next to a real (if contested) hadith grade.
  no_fixed_hadith: {
    label: "دعاء مأثور، وليس حديثًا نبويًا ثابتًا",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

interface AuthenticityBadgeProps {
  grade: Grade;
  narrator?: string;
  source: string;
  /**
   * Card-grid contexts (e.g. homepage featured duas): the full
   * no_fixed_hadith label wraps to two lines at pill width, which — under
   * CSS Grid's default row-stretch — inflates every sibling card in that
   * row. Shortened label only; the full wording (and the real grade) is
   * always one tap away on the actual dua page, and the tooltip below
   * still carries the complete explanation.
   */
  compact?: boolean;
}

const COMPACT_LABELS: Partial<Record<Grade, string>> = {
  no_fixed_hadith: "دعاء مأثور",
};

/**
 * Tooltip is pure CSS (group-hover / group-focus), no client JS needed —
 * this stays a plain server component.
 */
export function AuthenticityBadge({ grade, narrator, source, compact = false }: AuthenticityBadgeProps) {
  const { label, className } = GRADE_STYLES[grade];
  const displayLabel = compact ? (COMPACT_LABELS[grade] ?? label) : label;

  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${compact ? "whitespace-nowrap" : ""} ${className}`}
      >
        {displayLabel}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 w-max max-w-64 -translate-y-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {narrator ? <span className="block">الراوي: {narrator}</span> : null}
        <span className="block">المصدر: {source}</span>
      </span>
    </span>
  );
}
