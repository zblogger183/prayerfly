"use client";

import { AuthenticityBadge } from "@/components/AuthenticityBadge";
import { CopyButton } from "@/components/CopyButton";
import { DuaText } from "@/components/DuaText";
import { TashkeelToggle, usePersistedTashkeelPreference } from "@/components/TashkeelToggle";
import type { AdhkarItem } from "@/lib/adhkar-schema";

/**
 * One shared tashkeel toggle for the whole collection rather than one per
 * item — matches how someone actually reads a set of adhkar (toggle once,
 * read the whole set), and avoids N copies of the same client state.
 */
export function AdhkarItemsList({ items }: { items: AdhkarItem[] }) {
  const [showTashkeel, setShowTashkeel] = usePersistedTashkeelPreference();

  return (
    <div className="space-y-6">
      <TashkeelToggle value={showTashkeel} onChange={setShowTashkeel} />
      <ol className="space-y-4">
        {items.map((item) => (
          <li
            key={item.order}
            className="space-y-4 rounded-2xl border border-foreground/10 bg-surface p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                {item.order}
              </span>
              <AuthenticityBadge grade={item.authenticity_grade} source={item.primary_source} />
            </div>
            <DuaText text={item.arabic_text_tashkeel} showTashkeel={showTashkeel} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-sm text-foreground/70">
              {item.repetition_count && <span>{item.repetition_count}</span>}
              <CopyButton text={item.arabic_text_plain} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
