"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Lightweight per-character progress (learned + favorite), stored in the
// browser like lingora does — no DB, no server round-trip, works offline.
// Could migrate to the DB later for cross-device sync.

type Kind = "learned" | "fav";
const keyOf = (lang: string, kind: Kind) => `fluenta:char-${kind}-${lang}`;

// One shared subscriber pool so every cell + the modal re-render on a change.
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function readRaw(key: string): string {
  if (typeof localStorage === "undefined") return "[]";
  return localStorage.getItem(key) ?? "[]";
}

export function useCharSet(lang: string, kind: Kind) {
  const key = keyOf(lang, kind);
  // getSnapshot returns the raw string → stable identity while unchanged.
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => "[]");
  const set = useMemo<Set<string>>(() => {
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  }, [raw]);

  const toggle = useCallback(
    (char: string) => {
      if (typeof localStorage === "undefined") return;
      const cur = new Set<string>((() => {
        try {
          return JSON.parse(readRaw(key)) as string[];
        } catch {
          return [];
        }
      })());
      if (cur.has(char)) cur.delete(char);
      else cur.add(char);
      localStorage.setItem(key, JSON.stringify([...cur]));
      emit();
    },
    [key],
  );

  return { set, toggle };
}
