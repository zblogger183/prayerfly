interface AudioPlayerProps {
  audioUrl?: string;
}

/**
 * Native <audio controls>, no custom play/pause state — so no "use client"
 * needed. Browser-native controls are also more accessible for free than a
 * hand-rolled player would be at this stage.
 */
export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  if (!audioUrl) return null;

  return (
    <audio controls preload="none" className="w-full max-w-sm" src={audioUrl}>
      متصفحك لا يدعم تشغيل الصوت.
    </audio>
  );
}
