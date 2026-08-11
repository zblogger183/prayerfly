"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "prayerfly:showTashkeel";
const DEFAULT_VALUE = true;

type Listener = () => void;
const listeners = new Set<Listener>();

function getSnapshot(): boolean {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null ? DEFAULT_VALUE : stored === "1";
}

// Used only for the server-rendered pass and the very first client render,
// before hydration can touch localStorage at all.
function getServerSnapshot(): boolean {
  return DEFAULT_VALUE;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

interface TashkeelToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
}

/**
 * Deliberately controlled (value/onChange), not self-contained state: the
 * page template (Sprint 4) needs the same boolean to reach DuaText, which
 * may not be a sibling. usePersistedTashkeelPreference() below is the piece
 * that reads/writes localStorage — call it once per page and pass the
 * result down to both this and DuaText.
 */
export function TashkeelToggle({ value, onChange }: TashkeelToggleProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
      <span>التشكيل</span>
      <span
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onClick={() => onChange(!value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!value);
          }
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-emerald-600" : "bg-foreground/20"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "-translate-x-1" : "-translate-x-6"
          }`}
        />
      </span>
    </label>
  );
}

/**
 * localStorage is an external store from React's point of view, so this
 * uses useSyncExternalStore rather than useState+useEffect — reading it
 * during an effect and calling setState from there is flagged by the
 * react-hooks/set-state-in-effect rule (and useSyncExternalStore is the
 * primitive React ships specifically for this: subscribing to a mutable
 * source outside React while staying hydration-safe).
 */
export function usePersistedTashkeelPreference() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = (next: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    listeners.forEach((listener) => listener());
  };

  return [value, update] as const;
}
