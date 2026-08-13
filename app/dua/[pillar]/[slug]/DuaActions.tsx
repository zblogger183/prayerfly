"use client";

import { DuaText } from "@/components/DuaText";
import { TashkeelToggle, usePersistedTashkeelPreference } from "@/components/TashkeelToggle";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CopyButton } from "@/components/CopyButton";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareImageButton } from "@/components/ShareImageButton";

interface DuaActionsProps {
  textTashkeel: string;
  textPlain: string;
  title: string;
  slug: string;
  audioUrl?: string;
}

/**
 * Section 5 block 3 ("the dua itself — large type, tashkeel toggle, copy
 * button, audio player, share button"), assembled from the Sprint 3
 * primitives. TashkeelToggle and DuaText need a shared boolean, so this is
 * the client boundary that owns it — same pattern as Sprint 3's
 * TashkeelDemo, just for the real template instead of the dev gallery.
 */
export function DuaActions({ textTashkeel, textPlain, title, slug, audioUrl }: DuaActionsProps) {
  const [showTashkeel, setShowTashkeel] = usePersistedTashkeelPreference();

  return (
    <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-foreground/10 px-5 py-3 sm:px-6">
        <span className="text-xs font-semibold tracking-wide text-foreground/40">نص الدعاء</span>
        <TashkeelToggle value={showTashkeel} onChange={setShowTashkeel} />
      </div>

      <div className="px-5 py-8 sm:px-6 sm:py-10">
        <DuaText text={textTashkeel} showTashkeel={showTashkeel} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-foreground/10 bg-background px-5 py-4 sm:px-6">
        <CopyButton text={textPlain} />
        <ShareImageButton text={textPlain} title={title} fileName={slug} />
        <BookmarkButton slug={slug} />
      </div>

      {audioUrl && (
        <div className="border-t border-foreground/10 px-5 py-4 sm:px-6">
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      )}
    </div>
  );
}
