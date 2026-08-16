import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ArabicShaper } from "arabic-persian-reshaper";
import { stripTashkeel } from "@/lib/arabic";

// Satori (next/og's renderer) does not implement OpenType GSUB contextual
// substitution (lookupType 5) — confirmed empirically against every font
// tried here (Naskh, Sans, Kufi, even a hand-subsetted one), so this isn't
// a font choice problem, it's a Satori limitation with real Arabic joining
// shapes. The standard workaround: pre-shape the text into its Arabic
// Presentation Forms-B glyphs (U+FE70–FEFF) ourselves before handing it to
// Satori, so glyph selection becomes a plain cmap lookup (which Satori
// supports) instead of a contextual substitution Satori can't perform.
// Non-Arabic characters (digits, Latin) pass through unchanged.
// Arabic-specific punctuation (، ؛ ؟ ٪ « ») triggers the same unsupported
// GSUB lookup as unshaped letters, even after reshaping the letters
// themselves — isolated empirically (single-character repro: "والسنة،"
// crashed, "والسنة" without the comma did not). Swapped for plain
// ASCII/Latin equivalents here only; this never touches real page content,
// just the decorative OG card text.
const UNSUPPORTED_PUNCTUATION: [RegExp, string][] = [
  [/،/g, ","],
  [/؛/g, ";"],
  [/؟/g, "?"],
  [/٪/g, "%"],
  [/[«»]/g, '"'],
  // ﷺ (U+FDFA), the single-codepoint "sallallahu alayhi wa sallam"
  // ligature used throughout the dua/adhkar corpus after "النبي" — same
  // unsupported-lookup crash, isolated the same way ("عن النبي ﷺ تُقال"
  // failed, "عن النبي تُقال" without it did not). Dropped rather than
  // spelled out — "النبي" alone still reads correctly in a decorative card.
  [/ﷺ/g, ""],
];

function reshapeArabic(text: string): string {
  // Tashkeel (fatha/damma/kasra/tanwin/shadda/sukun) triggers the same
  // unsupported GSUB lookup as the punctuation above — isolated the same
  // way ("الاستغفار ثلاثًا" crashed on the tanwin mark alone). Reused
  // rather than duplicated: same stripTashkeel() the tashkeel-toggle
  // component already uses, applied only to this decorative OG text —
  // the real dua text elsewhere on the page keeps full tashkeel.
  let sanitized = stripTashkeel(text);
  for (const [pattern, replacement] of UNSUPPORTED_PUNCTUATION) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  return ArabicShaper.convertArabic(sanitized);
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const GRADE_LABELS: Record<string, string> = {
  sahih: "صحيح",
  hasan: "حسن",
  daif: "ضعيف",
  mixed: "خلاف بين المحدثين",
  no_fixed_hadith: "دعاء مأثور",
};

export function gradeLabel(grade: string): string {
  return GRADE_LABELS[grade] ?? grade;
}

// Static-weight TTFs downloaded once from Google Fonts' legacy (non-css2)
// endpoint, which still serves plain .ttf — the same Noto Naskh
// Arabic/Noto Sans Arabic families next/font/google loads for the rest of
// the site, so OG cards match the on-page brand. ImageResponse (Satori)
// needs real font bytes, not a CSS @font-face reference, and can't consume
// the variable-font files Google's own font repo ships by default (no
// weight-axis instancing) — these are pre-instantiated single-weight
// files instead. Read once per server process at module scope, per Next's
// own opengraph-image docs ("predictable values" — not per-request).
const naskhFontPromise = readFile(join(process.cwd(), "assets/fonts/NotoNaskhArabic-Bold.ttf"));
const sansFontPromise = readFile(join(process.cwd(), "assets/fonts/NotoSansArabic-SemiBold.ttf"));

interface OgCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

function titleFontSize(title: string): number {
  if (title.length <= 30) return 56;
  if (title.length <= 55) return 44;
  return 34;
}

export async function renderOgCard({ eyebrow, title, subtitle }: OgCardProps) {
  const [naskhFont, sansFont] = await Promise.all([naskhFontPromise, sansFontPromise]);
  const shapedEyebrow = eyebrow ? reshapeArabic(eyebrow) : undefined;
  const shapedTitle = reshapeArabic(title);
  const shapedSubtitle = subtitle ? reshapeArabic(subtitle) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          direction: "rtl",
          background: "linear-gradient(180deg, #1c4b42 0%, #3b9b89 100%)",
          fontFamily: "Noto Sans Arabic",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            margin: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid rgba(255,255,255,0.25)",
            borderRadius: "24px",
            padding: "48px",
          }}
        >
          {shapedEyebrow && (
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.75)",
                fontSize: 28,
                marginBottom: 24,
              }}
            >
              {shapedEyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontFamily: "Noto Naskh Arabic",
              fontSize: titleFontSize(title),
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: "920px",
            }}
          >
            {shapedTitle}
          </div>
          {shapedSubtitle && (
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.82)",
                fontSize: 26,
                textAlign: "center",
                lineHeight: 1.6,
                marginTop: 28,
                maxWidth: "820px",
              }}
            >
              {shapedSubtitle}
            </div>
          )}
          <div
            style={{
              display: "flex",
              direction: "ltr",
              color: "rgba(255,255,255,0.65)",
              fontSize: 24,
              marginTop: 36,
            }}
          >
            PrayerFly · prayerfly.com
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Noto Naskh Arabic", data: naskhFont, style: "normal", weight: 700 },
        { name: "Noto Sans Arabic", data: sansFont, style: "normal", weight: 600 },
      ],
    }
  );
}
