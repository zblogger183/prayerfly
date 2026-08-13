import { useId } from "react";

/**
 * No brand assets exist yet (public/ only had create-next-app placeholders)
 * — this is the site's first real mark. Crescent + a small four-point star
 * is a deliberately simple, universally-legible Islamic-content motif that
 * still renders crisply at 24-28px in the header. The crescent is two
 * circles combined via a mask (not a hand-authored curve) so the shape is
 * guaranteed correct at any size. It uses currentColor so callers control
 * its tone (text-primary on the white header, text-white on the green
 * footer band); the star stays the brand lime at every use, matching
 * Section 8's "small deliberate dot/accent" rule for --secondary.
 *
 * Header and Footer both render this on the same page, so the mask needs a
 * per-instance id — two <mask id="x"> elements in one document collide.
 */
export function Logo({ className }: { className?: string }) {
  const maskId = useId();

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="white" />
        <circle cx="20" cy="12" r="9" fill="black" />
      </mask>
      <circle cx="16" cy="16" r="11" fill="currentColor" mask={`url(#${maskId})`} />
      <path
        d="M22.5 5.5L23.6 8.4L26.5 9.5L23.6 10.6L22.5 13.5L21.4 10.6L18.5 9.5L21.4 8.4L22.5 5.5Z"
        fill="var(--secondary)"
      />
    </svg>
  );
}
