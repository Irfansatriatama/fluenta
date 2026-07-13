"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ExternalLink, Star, Volume2, X } from "lucide-react";
import { CharFlashcard, CharQuiz } from "@/components/lesson/CharModes";
import { useCharSet } from "@/lib/charProgress";
import { speak } from "@/lib/tts";
import type { CharGroup, CharItem } from "@/lib/staticContent";

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
  const [mode, setMode] = useState<"table" | "flashcard" | "quiz">("table");
  const [filter, setFilter] = useState<"all" | "unlearned" | "fav">("all");
  const [sel, setSel] = useState<CharItem | null>(null);
  const reduce = useReducedMotion();
  const { set: learned, toggle: toggleLearned } = useCharSet(lang, "learned");
  const { set: favs, toggle: toggleFav } = useCharSet(lang, "fav");
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
  const activeItems = shown.flatMap((s) => s.group.items);
  const learnedInSet = activeItems.filter((c) => learned.has(c.char)).length;
  const matchFilter = (c: CharItem) =>
    filter === "all" ? true : filter === "fav" ? favs.has(c.char) : !learned.has(c.char);
  const ref = sel ? referenceUrl(sel.char, lang) : null;

  const tabBase =
    "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors";
  const MODES = [
    { key: "table", label: "Tabel" },
    { key: "flashcard", label: "Flashcard" },
    { key: "quiz", label: "Kuis" },
  ] as const;

  return (
    <>
      {/* study-mode tabs — one set of characters, several ways to learn it */}
      <div className="mt-6 flex gap-2">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
              style={
                on
                  ? { backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }
                  : { color: "var(--color-ink-faint)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* category tabs — one writing system at a time, no endless scroll */}
      {cats.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
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

      {mode === "table" && (
      <>
      {/* progress + filter — mark characters learned (stored in your browser) */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          <span className="font-bold text-ink">{learnedInSet}</span> / {activeItems.length} hafal
        </p>
        <div className="flex gap-1.5">
          {([
            { k: "all", label: "Semua" },
            { k: "unlearned", label: "Belum hafal" },
            { k: "fav", label: "★ Favorit" },
          ] as const).map((f) => {
            const on = filter === f.k;
            return (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                style={
                  on
                    ? { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }
                    : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-8">
        {shown.map(({ sub, group }) => (
          <section key={group.title}>
            {!hasSub && cats.length <= 1 && (
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                {sub} <span className="text-ink-faint">({group.items.length})</span>
              </h2>
            )}
            {/* dense grid — a whole writing system fits in a screen or two,
                not 25 rows of big cards. Tap a cell for readings & example. */}
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(74px, 1fr))" }}>
              {group.items.filter(matchFilter).map((c, i) => {
                // Kana readings are short (romaji) → show them. Kanji "sub" is a
                // long list of on/kun readings → show the meaning instead, and
                // keep the full detail for the modal. Either way, one clipped line.
                const shortSub = (c.sub?.length ?? 0) <= 6;
                const hint = shortSub ? c.sub : c.meaning;
                const isLearned = learned.has(c.char);
                return (
                  <div
                    key={i}
                    className="fl-lift relative flex h-[4.75rem] flex-col overflow-hidden rounded-xl border text-center transition-colors hover:border-[color:var(--accent)] hover:shadow-soft"
                    style={
                      isLearned
                        ? { borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 7%, var(--color-paper))" }
                        : { borderColor: "var(--color-edge)", backgroundColor: "var(--color-paper)" }
                    }
                  >
                    {isLearned && (
                      <span className="absolute left-0.5 top-0.5 z-10 grid h-4 w-4 place-items-center rounded-full text-white" style={{ backgroundColor: "var(--accent)" }}>
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                    <button
                      onClick={() => setSel(c)}
                      title={[c.sub, c.meaning].filter(Boolean).join(" · ") || undefined}
                      className="flex h-full w-full flex-col items-center justify-center gap-1 px-1"
                    >
                      <span className="font-display text-[1.7rem] font-bold leading-none text-ink" lang={lang}>{c.char}</span>
                      {hint && (
                        <span className="block w-full truncate px-0.5 text-[0.6rem] font-semibold leading-tight" style={{ color: "var(--accent)" }}>
                          {hint}
                        </span>
                      )}
                    </button>
                    {/* per-cell voice — hear the character without opening the modal */}
                    <button
                      onClick={() => speak(c.char, lang)}
                      aria-label={`Dengar ${c.char}`}
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full text-ink-faint transition-colors hover:bg-paper-2 hover:text-[color:var(--accent)]"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {activeItems.filter(matchFilter).length === 0 && (
          <p className="rounded-2xl border hairline bg-paper p-6 text-center text-sm text-ink-soft">
            {filter === "fav" ? "Belum ada favorit. Buka detail karakter lalu ketuk bintang." : "Semua karakter di set ini sudah kamu tandai hafal."}
          </p>
        )}
      </div>
      </>
      )}

      {mode === "flashcard" && <CharFlashcard key={`fc-${catIdx}-${activeSub}`} items={activeItems} lang={lang} />}
      {mode === "quiz" && <CharQuiz key={`qz-${catIdx}-${activeSub}`} items={activeItems} lang={lang} />}

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
                  <button
                    onClick={() => toggleFav(sel.char)}
                    aria-label="Favorit"
                    className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-paper-2"
                    style={{ color: favs.has(sel.char) ? "var(--color-gold)" : "var(--color-ink-faint)" }}
                  >
                    <Star className="h-5 w-5" fill={favs.has(sel.char) ? "currentColor" : "none"} />
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
                  <button
                    onClick={() => toggleLearned(sel.char)}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors"
                    style={
                      learned.has(sel.char)
                        ? { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }
                        : { borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }
                    }
                  >
                    <Check className="h-4 w-4" /> {learned.has(sel.char) ? "Hapus tanda hafal" : "Tandai hafal"}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
