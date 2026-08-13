"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/30 hover:bg-primary-50 hover:text-primary"
    >
      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      {copied ? "تم النسخ" : "نسخ"}
    </button>
  );
}
