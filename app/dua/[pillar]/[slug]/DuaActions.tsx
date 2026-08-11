"use client";

import { DuaText } from "@/components/DuaText";
import { TashkeelToggle, usePersistedTashkeelPreference } from "@/components/TashkeelToggle";
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
    <div className="space-y-4">
      <TashkeelToggle value={showTashkeel} onChange={setShowTashkeel} />
      <DuaText text={textTashkeel} showTashkeel={showTashkeel} />
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={textPlain} />
        <ShareImageButton text={textPlain} title={title} fileName={slug} />
      </div>
      <AudioPlayer audioUrl={audioUrl} />
    </div>
  );
}
