"use client";

import { DuaText } from "@/components/DuaText";
import { TashkeelToggle, usePersistedTashkeelPreference } from "@/components/TashkeelToggle";

/**
 * Demo-only glue: TashkeelToggle and DuaText are deliberately separate,
 * uncoupled components (per Sprint 3's spec), so something has to own the
 * shared boolean between them. In the real page template (Sprint 4) that
 * owner is the page itself; here it's this small wrapper.
 */
export function TashkeelDemo({ text }: { text: string }) {
  const [showTashkeel, setShowTashkeel] = usePersistedTashkeelPreference();

  return (
    <div className="space-y-3">
      <TashkeelToggle value={showTashkeel} onChange={setShowTashkeel} />
      <DuaText text={text} showTashkeel={showTashkeel} />
    </div>
  );
}
