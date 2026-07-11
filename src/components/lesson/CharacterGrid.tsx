"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Volume2, X } from "lucide-react";
import type { CharGroup, CharItem } from "@/lib/staticContent";

const TTS_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TTS_LANG[lang] ?? "ja-JP";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// Jisho for JP, else Wiktionary — a real reference for deeper detail.
function referenceUrl(char: string, lang: string) {
  if (lang === "ja") return { label: "Look up on Jisho", href: `https://jisho.org/search/${encodeURIComponent(char)}` };
  return { label: "Look up on Wiktionary", href: `https://en.wiktionary.org/wiki/${encodeURIComponent(char)}` };
}

export function CharacterGrid({ groups, lang }: { groups: CharGroup[]; lang: string }) {
  const [sel, setSel] = useState<CharItem | null>(null);
  const reduce = useReducedMotion();
  const ref = sel ? referenceUrl(sel.char, lang) : null;

  return (
    <>
      <div className="mt-6 flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
              {group.title} <span className="text-ink-faint">({group.items.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSel(c)}
                  className="fl-lift rounded-2xl border hairline bg-paper p-4 text-left shadow-soft hover:border-[color:var(--accent)] hover:shadow-lift"
                >
                  <p className="font-display text-3xl font-bold text-ink" lang={lang}>{c.char}</p>
                  {c.sub && <p className="mt-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>{c.sub}</p>}
                  {c.meaning && <p className="mt-0.5 truncate text-xs text-ink-soft">{c.meaning}</p>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={() => setSel(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl border hairline bg-paper p-6 shadow-lift"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? { opacity: 0 } : { y: 64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 48, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <button
                onClick={() => setSel(null)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid place-items-center pt-2">
                <p className="font-display text-6xl font-bold text-ink" lang={lang}>{sel.char}</p>
                {sel.sub && <p className="mt-2 text-center text-lg font-semibold" style={{ color: "var(--accent)" }}>{sel.sub}</p>}
                {sel.meaning && <p className="mt-1 text-center text-sm text-ink-soft">{sel.meaning}</p>}
              </div>

              {sel.example && (
                <div className="mt-4 rounded-2xl border-l-2 bg-paper-2/50 py-2.5 pl-3 pr-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">Example</p>
                  <p className="mt-0.5 font-display text-sm leading-relaxed text-ink" lang={lang}>{sel.example}</p>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => speak(sel.char, lang)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Volume2 className="h-4 w-4" /> Sound
                </button>
                {ref && (
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-edge px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-[color:var(--accent)]"
                  >
                    <ExternalLink className="h-4 w-4" /> Detail
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
