import { stripTashkeel } from "@/lib/arabic";

interface DuaTextProps {
  text: string;
  showTashkeel: boolean;
  className?: string;
}

/**
 * No "use client" here on purpose: this has no hooks or browser APIs of its
 * own, so it renders fine both on the server (Sprint 4's page template) and
 * inside a client tree (this sprint's live-toggle demo). Only the component
 * that OWNS the toggle state (TashkeelToggle) needs to be a client component.
 */
export function DuaText({ text, showTashkeel, className }: DuaTextProps) {
  const displayText = showTashkeel ? text : stripTashkeel(text);

  return (
    <p
      dir="rtl"
      className={`font-naskh text-2xl leading-loose text-foreground ${className ?? ""}`}
    >
      {displayText}
    </p>
  );
}
