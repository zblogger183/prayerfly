"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";

interface ShareImageButtonProps {
  text: string;
  title: string;
  fileName?: string;
}

const CARD_SIZE = 1080;
const PADDING = 96;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function renderCard(text: string, title: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Read the actual font stack next/font generated for dua text, rather
  // than hardcoding a family name — canvas text silently falls back to a
  // generic font if the name doesn't match exactly, which would break the
  // "branded" look this button exists for.
  const naskhFont =
    getComputedStyle(document.documentElement).getPropertyValue("--font-naskh") || "serif";
  const sansFont =
    getComputedStyle(document.documentElement).getPropertyValue("--font-sans-arabic") ||
    "sans-serif";

  await document.fonts.load(`48px ${naskhFont}`);
  await document.fonts.load(`28px ${sansFont}`);
  await document.fonts.ready;

  // Background — canvas can't read CSS custom properties, so these are the
  // same brand hex values from globals.css (--primary light/dark) spelled
  // out directly, not the old pre-brand-system emerald/teal placeholders.
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_SIZE);
  gradient.addColorStop(0, "#1c4b42");
  gradient.addColorStop(1, "#3b9b89");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, CARD_SIZE - 64, CARD_SIZE - 64);

  ctx.direction = "rtl";
  ctx.textAlign = "center";

  // Title
  ctx.font = `600 40px ${sansFont}`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(title, CARD_SIZE / 2, PADDING + 40, CARD_SIZE - PADDING * 2);

  // Dua text, wrapped and vertically centered in the space between the
  // title and the watermark. wrapText's line count depends on font size,
  // so a long dua (Ayat al-Kursi is ~50 words) can't just use a fixed 48px
  // — that would push lines up past the title or down past the watermark.
  // Step the font size down until the wrapped block actually fits, rather
  // than assuming a fixed size is safe for every dua length.
  const maxWidth = CARD_SIZE - PADDING * 2;
  const titleBottom = PADDING + 40 + 24; // below the title's baseline + descender
  const watermarkTop = CARD_SIZE - PADDING - 40; // above the watermark's ascender
  const availableHeight = watermarkTop - titleBottom;

  let fontSize = 48;
  let lines: string[] = [];
  let lineHeight = 0;
  const MIN_FONT_SIZE = 26;

  while (fontSize >= MIN_FONT_SIZE) {
    ctx.font = `${fontSize}px ${naskhFont}`;
    lines = wrapText(ctx, text, maxWidth);
    lineHeight = fontSize * 1.58;
    if (lines.length * lineHeight <= availableHeight) break;
    fontSize -= 2;
  }

  ctx.font = `${fontSize}px ${naskhFont}`;
  ctx.fillStyle = "#ffffff";
  const blockHeight = lines.length * lineHeight;
  const centerY = titleBottom + availableHeight / 2;
  let y = centerY - blockHeight / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, CARD_SIZE / 2, y, maxWidth);
    y += lineHeight;
  }

  // Watermark
  ctx.font = `28px ${sansFont}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.direction = "ltr";
  ctx.fillText("PrayerFly · prayerfly.com", CARD_SIZE / 2, CARD_SIZE - PADDING);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}

export function ShareImageButton({ text, title, fileName = "prayerfly-dua" }: ShareImageButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const blob = await renderCard(text, title);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-primary/30 hover:bg-foreground/5 disabled:opacity-50"
    >
      {busy ? <Download className="size-4 animate-pulse" /> : <Share2 className="size-4" />}
      {busy ? "جارٍ الإنشاء..." : "صورة للمشاركة"}
    </button>
  );
}
