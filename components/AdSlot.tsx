const SIZES = {
  banner: { width: 320, height: 100 },
  rectangle: { width: 300, height: 250 },
  leaderboard: { width: 728, height: 90 },
} as const;

interface AdSlotProps {
  size?: keyof typeof SIZES;
}

/**
 * Placeholder only — real AdSense unit gets wired in during Sprint 13.
 * The fixed width/height is the point: it must reserve its footprint
 * before the real ad script loads, or swapping in real ads later shifts
 * layout (the plan calls this out explicitly as the most common CLS
 * failure on ad-supported sites).
 */
export function AdSlot({ size = "rectangle" }: AdSlotProps) {
  const { width, height } = SIZES[size];

  return (
    <div
      style={{ width, height, maxWidth: "100%" }}
      className="mx-auto flex items-center justify-center rounded-lg border border-dashed border-foreground/20 bg-foreground/[0.03] text-xs text-foreground/40"
    >
      مساحة إعلانية · {width}×{height}
    </div>
  );
}
