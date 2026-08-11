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

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_SIZE);
  gradient.addColorStop(0, "#065f46");
  gradient.addColorStop(1, "#0f766e");
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

  // Dua text, wrapped and vertically centered in the remaining space
  ctx.font = `48px ${naskhFont}`;
  ctx.fillStyle = "#ffffff";
  const maxWidth = CARD_SIZE - PADDING * 2;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = 76;
  const blockHeight = lines.length * lineHeight;
  let y = CARD_SIZE / 2 - blockHeight / 2 + lineHeight / 2;
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 disabled:opacity-50"
    >
      {busy ? <Download className="size-4 animate-pulse" /> : <Share2 className="size-4" />}
      {busy ? "جارٍ الإنشاء..." : "صورة للمشاركة"}
    </button>
  );
}
