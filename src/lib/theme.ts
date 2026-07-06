import type { CSSProperties } from "react";
import { LANGUAGES, type Language } from "./languages";

// Single source of truth for a language's accent is LANGUAGES.
export function getLanguage(code: string): Language | null {
  return LANGUAGES.find((l) => l.code === code) ?? null;
}

// Sets --accent on a module root so the shared component set recolors per
// language. Falls back to the neutral brand gold.
export function accentVars(code: string): CSSProperties {
  const lang = getLanguage(code);
  return { "--accent": lang?.accent ?? "var(--color-gold)" } as CSSProperties;
}
