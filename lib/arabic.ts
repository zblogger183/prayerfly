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
