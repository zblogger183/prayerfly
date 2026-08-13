"use client";

import { useId } from "react";

/**
 * Decorative-only (aria-hidden, pointer-events-none) tiled Islamic
 * eight-point star motif — two overlapping squares, the classic
 * construction for this pattern, not a hand-drawn star path. Deliberately
 * an outline at very low opacity via `currentColor` (callers set a faint
 * text color, e.g. text-primary/10) so it reads as texture, never as a
 * colored background wash — same "small deliberate touch" spirit as
 * Section 8's rule for --secondary, applied here to keep the brand-color
 * footprint of a whole hero section small even though the pattern covers
 * it edge to edge.
 *
 * "use client" only because useId needs to be stable per mount when this
 * renders inside client-boundary heroes too; it has no interactivity.
 */
export function GeometricPattern({ className }: { className?: string }) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id={patternId}
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(-32 -32)"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="14" y="14" width="28" height="28" />
            <rect x="14" y="14" width="28" height="28" transform="rotate(45 28 28)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
