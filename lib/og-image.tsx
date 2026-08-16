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

// Matches a maximal run of Arabic-script characters (plain letters or
// already-shaped presentation forms) vs. everything else (spaces, digits,
// Latin, leftover punctuation) in one alternating pass.
const ARABIC_RUN = /[؀-ۿﭐ-﷿ﹰ-﻿]+|[^؀-ۿﭐ-﷿ﹰ-﻿]+/g;

/**
 * Satori paints a string as a flat left-to-right glyph run — it does not
 * implement the Unicode bidi algorithm itself (confirmed empirically:
 * plain Arabic text painted glyphs in logical rather than visual order
 * regardless of the CSS `direction` property, which only affects
 * layout/alignment, not character reordering). To get correct visual RTL
 * output we do the reordering ourselves before handing text to Satori:
 * reverse the run order (so the first logical word ends up painted last,
 * i.e. rightmost) and reverse characters *within* each Arabic run (so its
 * glyphs paint in the right sequence) — but never reverse a non-Arabic
 * run's own internal order, or embedded numbers/dates come out backwards
 * ("2026" → "6202"). This is a narrow, purpose-built substitute for real
 * bidi resolution, good enough for this decorative single-line-ish card
 * text — not a general-purpose bidi implementation.
 */
function visualOrder(text: string): string {
  const runs = text.match(ARABIC_RUN) ?? [];
  // Fresh non-global regex for the per-run membership check — reusing the
  // module-level ARABIC_RUN (which has the `g` flag) with .test() here
  // would be stateful across iterations and silently skip matches.
  const isArabicRun = /[؀-ۿﭐ-﷿ﹰ-﻿]/;
  return runs
    .reverse()
    .map((run) => (isArabicRun.test(run) ? [...run].reverse().join("") : run))
    .join("");
}

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
  const shaped = ArabicShaper.convertArabic(sanitized);
  return visualOrder(shaped);
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

// app/icon.png (not the assets/logo-icon.svg vector) — Satori's <img>
// reliably handles a raster data URI the way Next's own opengraph-image
// docs demonstrate; SVG-in-Satori support is inconsistent. The icon's own
// line art is brand dark-green, which would vanish against this card's
// dark-green gradient, so it sits on a small white badge below rather than
// directly on the gradient — contrast by construction, not by recoloring
// the source asset.
const logoIconPromise = readFile(join(process.cwd(), "app/icon.png")).then(
  (buf) => `data:image/png;base64,${buf.toString("base64")}`
);

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
  const [naskhFont, sansFont, logoIcon] = await Promise.all([
    naskhFontPromise,
    sansFontPromise,
    logoIconPromise,
  ]);
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "#ffffff",
              marginBottom: 20,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoIcon} width={46} height={46} alt="" />
          </div>
          {shapedEyebrow && (
            <div
              style={{
                display: "flex",
                direction: "ltr",
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
              direction: "ltr",
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
                direction: "ltr",
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
