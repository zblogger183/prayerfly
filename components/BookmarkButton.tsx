"use client";

import { useSyncExternalStore } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

const STORAGE_KEY = "prayerfly:bookmarks";

type Listener = () => void;
const listeners = new Set<Listener>();

function readAll(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toggleBookmark(slug: string) {
  const current = readAll();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

interface BookmarkButtonProps {
  slug: string;
}

export function BookmarkButton({ slug }: BookmarkButtonProps) {
  // Same useSyncExternalStore reasoning as TashkeelToggle: localStorage is
  // an external store, not React state, so this reads it via the primitive
  // built for that rather than useState+useEffect.
  const bookmarked = useSyncExternalStore(
    subscribe,
    () => readAll().includes(slug),
    () => false
  );

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(slug)}
      aria-pressed={bookmarked}
      className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
    >
      {bookmarked ? (
        <BookmarkCheck className="size-4 text-emerald-600" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {bookmarked ? "محفوظ" : "احفظ"}
    </button>
  );
}
