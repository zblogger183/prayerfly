/**
 * Diacritic stripping for DISPLAY (the tashkeel toggle). This only removes
 * harakat/tatweel — it must never touch alef forms or ة/ه the way
 * scripts/dedupe-clusters.ts's normalizeArabic() does, since that would
 * silently change the actual spelling shown to a reader.
 */
const TASHKEEL_AND_TATWEEL = /[ً-ٰٟۖ-ۭـ]/g;

export function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL_AND_TATWEEL, "");
}

/**
 * Word-boundary-aware truncation for meta descriptions (quick_answer can be
 * up to 400 chars per the Zod schema; search engines cut meta descriptions
 * around ~155-160). Breaks at the last space before the limit rather than
 * mid-word.
 */
export function truncateForMeta(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

/**
 * Same word-boundary truncation as truncateForMeta, tuned for <title>
 * instead of meta description. Google's SERP title display cuts off
 * around ~60 characters (less for Arabic's wider average glyph width) —
 * beyond that the tab/SERP title gets truncated mid-word by the browser
 * or search engine itself, which reads worse than a clean, shorter title
 * chosen deliberately. Kept separate from truncateForMeta rather than a
 * shared default so each call site's limit stays self-documenting.
 */
export function truncateForTitle(text: string, maxLength = 58): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
}

/**
 * Loose matching for client-side search (homepage), not a spelling
 * authority — real canonicalization is scripts/dedupe-clusters.ts's job at
 * content-plan build time. This just folds the same few variants a typist
 * commonly mixes up (أ/إ/آ→ا, ى→ي, ة→ه) plus tashkeel, so "الاستخاره"
 * finds "الاستخارة" without needing an exact-spelling match.
 */
export function normalizeForSearch(text: string): string {
  return stripTashkeel(text)
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .trim();
}
