"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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
  if (lang === "ja") return { label: "Cari di Jisho", href: `https://jisho.org/search/${encodeURIComponent(char)}` };
  return { label: "Cari di Wiktionary", href: `https://en.wiktionary.org/wiki/${encodeURIComponent(char)}` };
}

// Group titles look like "Kanji · JLPT N5" — split into a top category (Kanji)
// and a sub-label (JLPT N5) so a huge set becomes tabs instead of one endless
// scroll. Categories with a single group need no sub-tabs.
type Category = { name: string; groups: { sub: string; group: CharGroup }[] };

function categorize(groups: CharGroup[]): Category[] {
  const order: string[] = [];
  const map = new Map<string, { sub: string; group: CharGroup }[]>();
  for (const g of groups) {
    const parts = g.title.split(" · ");
    const name = parts[0];
    const sub = parts.slice(1).join(" · ") || g.title;
    if (!map.has(name)) {
      map.set(name, []);
      order.push(name);
    }
    map.get(name)!.push({ sub, group: g });
  }
  return order.map((name) => ({ name, groups: map.get(name)! }));
}

function countOf(cat: Category): number {
  return cat.groups.reduce((n, g) => n + g.group.items.length, 0);
}

export function CharacterGrid({ groups, lang }: { groups: CharGroup[]; lang: string }) {
  const cats = useMemo(() => categorize(groups), [groups]);
  const [catIdx, setCatIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [sel, setSel] = useState<CharItem | null>(null);
  const reduce = useReducedMotion();
  // true only on the client — so the body portal is never attempted during SSR
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);

  // close on Escape
  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const cat = cats[catIdx] ?? cats[0];
  const hasSub = cat.groups.length > 1;
  const activeSub = Math.min(subIdx, cat.groups.length - 1);
  const shown = hasSub ? [cat.groups[activeSub]] : cat.groups;
  const ref = sel ? referenceUrl(sel.char, lang) : null;

  const tabBase =
    "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors";

  return (
    <>
      {/* category tabs — one writing system at a time, no endless scroll */}
      {cats.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c, i) => {
            const active = i === catIdx;
            return (
              <button
                key={c.name}
                onClick={() => {
                  setCatIdx(i);
                  setSubIdx(0);
                }}
                className={tabBase}
                style={
                  active
                    ? { borderColor: "var(--accent)", backgroundColor: "var(--accent)", color: "#fff" }
                    : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }
                }
              >
                {c.name}
                <span className={active ? "ml-1.5 opacity-80" : "ml-1.5 text-ink-faint"}>{countOf(c)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* sub tabs (e.g. kanji by JLPT level) */}
      {hasSub && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {cat.groups.map((g, i) => {
            const active = i === activeSub;
            return (
              <button
                key={g.sub}
                onClick={() => setSubIdx(i)}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                style={
                  active
                    ? { backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }
                    : { color: "var(--color-ink-faint)" }
                }
              >
                {g.sub} <span className="opacity-70">({g.group.items.length})</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-8">
        {shown.map(({ sub, group }) => (
          <section key={group.title}>
            {!hasSub && cats.length <= 1 && (
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                {sub} <span className="text-ink-faint">({group.items.length})</span>
              </h2>
            )}
            {/* dense grid — a whole writing system fits in a screen or two,
                not 25 rows of big cards. Tap a cell for readings & example. */}
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
              {group.items.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSel(c)}
                  title={c.meaning || undefined}
                  className="fl-lift flex flex-col items-center justify-center rounded-xl border hairline bg-paper px-1 py-2 text-center hover:border-[color:var(--accent)] hover:shadow-soft"
                >
                  <span className="font-display text-xl font-bold leading-none text-ink sm:text-2xl" lang={lang}>{c.char}</span>
                  {c.sub && <span className="mt-1 block truncate text-[0.65rem] font-semibold leading-none" style={{ color: "var(--accent)" }}>{c.sub}</span>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {isClient &&
        createPortal(
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
                  initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: 16, opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                >
                  <button
                    onClick={() => setSel(null)}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
                    aria-label="Tutup"
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
                      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">Contoh</p>
                      <p className="mt-0.5 font-display text-sm leading-relaxed text-ink" lang={lang}>{sel.example}</p>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => speak(sel.char, lang)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <Volume2 className="h-4 w-4" /> Suara
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
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
