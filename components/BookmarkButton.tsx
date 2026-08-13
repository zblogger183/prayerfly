"use client";

import { useSyncExternalStore } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

const STORAGE_KEY = "prayerfly:bookmarks";

type Listener = () => void;
const listeners = new Set<Listener>();

const EMPTY_BOOKMARKS: string[] = [];

function readAll(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore requires getSnapshot to return a stable reference
// when nothing changed — readAll() parses fresh JSON every call, so a naive
// `() => readAll()` snapshot would return a new array identity on every
// render and infinite-loop. Cache by the raw string instead; only the
// bookmark-list consumer (useBookmarkedSlugs) needs the array itself, so
// this caching lives here rather than duplicated at the call site.
let cachedRaw: string | null = null;
let cachedList: string[] = [];

function readAllStable(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedList = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      cachedList = [];
    }
  }
  return cachedList;
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

/**
 * Shared with the bookmarks page (`/محفوظاتي/`) so it stays in sync with
 * whatever BookmarkButton actually toggles, rather than a second
 * independent read of the same localStorage key.
 */
export function useBookmarkedSlugs(): string[] {
  return useSyncExternalStore(subscribe, readAllStable, () => EMPTY_BOOKMARKS);
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
      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/30 hover:bg-primary-50 hover:text-primary"
    >
      {bookmarked ? (
        <BookmarkCheck className="size-4 text-primary" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {bookmarked ? "محفوظ" : "احفظ"}
    </button>
  );
}
