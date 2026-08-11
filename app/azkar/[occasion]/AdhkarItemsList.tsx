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
      <ol className="space-y-8">
        {items.map((item) => (
          <li
            key={item.order}
            className="space-y-3 border-b border-foreground/10 pb-6 last:border-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground/50">#{item.order}</span>
              <AuthenticityBadge grade={item.authenticity_grade} source={item.primary_source} />
            </div>
            <DuaText text={item.arabic_text_tashkeel} showTashkeel={showTashkeel} />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/70">
              {item.repetition_count && <span>{item.repetition_count}</span>}
              <CopyButton text={item.arabic_text_plain} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
