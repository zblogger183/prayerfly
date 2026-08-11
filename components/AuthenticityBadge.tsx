import type { Dua } from "@/lib/schema";

type Grade = Dua["authenticity_grade"];

const GRADE_STYLES: Record<Grade, { label: string; className: string }> = {
  sahih: { label: "صحيح", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  hasan: { label: "حسن", className: "bg-amber-100 text-amber-800 border-amber-300" },
  daif: { label: "ضعيف", className: "bg-red-100 text-red-800 border-red-300" },
  mixed: { label: "متفاوت", className: "bg-zinc-100 text-zinc-700 border-zinc-300" },
};

interface AuthenticityBadgeProps {
  grade: Grade;
  narrator?: string;
  source: string;
}

/**
 * Tooltip is pure CSS (group-hover / group-focus), no client JS needed —
 * this stays a plain server component.
 */
export function AuthenticityBadge({ grade, narrator, source }: AuthenticityBadgeProps) {
  const { label, className } = GRADE_STYLES[grade];

  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${className}`}
      >
        {label}
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
