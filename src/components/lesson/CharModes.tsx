"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";
import type { CharItem } from "@/lib/staticContent";

// The short "answer" for a character: romaji for kana, meaning for kanji.
function hintOf(c: CharItem): string {
  const shortSub = (c.sub?.length ?? 0) <= 6;
  return (shortSub ? c.sub : c.meaning) || c.sub || c.meaning || "";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Flashcard mode ────────────────────────────────────────────────
export function CharFlashcard({ items, lang }: { items: CharItem[]; lang: string }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = items[i];
  if (!c) return null;

  const go = (d: number) => {
    setFlipped(false);
    setI((x) => (x + d + items.length) % items.length);
  };

  return (
    <div className="mx-auto mt-6 max-w-sm">
      <p className="text-center text-xs font-semibold text-ink-faint">{i + 1} / {items.length}</p>
      <div className="fl-flip-scene mt-3 h-64 cursor-pointer" onClick={() => setFlipped((f) => !f)}>
        <div className={`fl-flip-card relative h-full w-full ${flipped ? "is-flipped" : ""}`}>
          <div className="fl-flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border hairline bg-paper shadow-lift">
            <span className="font-display text-7xl font-bold text-ink" lang={lang}>{c.char}</span>
            <button
              onClick={(e) => { e.stopPropagation(); speak(c.char, lang); }}
              aria-label={`Dengar ${c.char}`}
              className="mt-4 grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-2 hover:text-[color:var(--accent)]"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-ink-faint">Ketuk untuk balik</p>
          </div>
          <div
            className="fl-flip-face fl-flip-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl border bg-paper p-6 text-center shadow-lift"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
          >
            {c.sub && <p className="font-display text-3xl font-bold" style={{ color: "var(--accent)" }}>{c.sub}</p>}
            {c.meaning && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.meaning}</p>}
            {c.example && <p className="mt-3 font-display text-lg leading-relaxed text-ink" lang={lang}>{c.example}</p>}
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={() => go(-1)} className="inline-flex items-center gap-1.5 rounded-xl border border-edge bg-paper px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-[color:var(--accent)]">
          <ArrowLeft className="h-4 w-4" /> Sebelumnya
        </button>
        <button onClick={() => go(1)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
          Berikutnya <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Quiz mode ─────────────────────────────────────────────────────
type QuizQ = { correct: CharItem; options: CharItem[] };

function makeQuestion(pool: CharItem[]): QuizQ {
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(pool.filter((c) => c.char !== correct.char)).slice(0, 3);
  return { correct, options: shuffle([correct, ...wrong]) };
}

export function CharQuiz({ items, lang }: { items: CharItem[]; lang: string }) {
  const pool = useMemo(() => items.filter((c) => hintOf(c)), [items]);
  const [q, setQ] = useState<QuizQ | null>(() => (pool.length >= 2 ? makeQuestion(pool) : null));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  if (!q) {
    return <p className="mt-8 text-center text-sm text-ink-soft">Set ini terlalu kecil untuk kuis.</p>;
  }

  function choose(c: CharItem) {
    if (picked) return;
    setPicked(c.char);
    setTotal((t) => t + 1);
    if (c.char === q!.correct.char) setScore((s) => s + 1);
    speak(q!.correct.char, lang);
  }

  function next() {
    setPicked(null);
    setQ(makeQuestion(pool));
  }

  return (
    <div className="mx-auto mt-6 max-w-md">
      <div className="flex justify-center gap-5 text-xs font-semibold text-ink-soft">
        <span>Benar: <span className="text-ink">{score}</span></span>
        <span>Total: <span className="text-ink">{total}</span></span>
        <span>Akurasi: <span className="text-ink">{total ? Math.round((score / total) * 100) : 0}%</span></span>
      </div>

      <div className="mt-5 grid place-items-center rounded-3xl border hairline bg-paper py-10 shadow-soft">
        <span className="font-display text-7xl font-bold text-ink" lang={lang}>{q.correct.char}</span>
        <button
          onClick={() => speak(q.correct.char, lang)}
          aria-label="Dengar"
          className="mt-3 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:text-[color:var(--accent)]"
        >
          <Volume2 className="h-5 w-5" />
        </button>
        <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-ink-faint">Pilih bacaan/arti yang benar</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {q.options.map((opt) => {
          const isAnswer = opt.char === q.correct.char;
          const isPicked = opt.char === picked;
          let style: React.CSSProperties = { borderColor: "var(--color-edge)" };
          if (picked && isAnswer) style = { borderColor: "#2F7D53", backgroundColor: "color-mix(in srgb, #2F7D53 10%, transparent)" };
          else if (picked && isPicked) style = { borderColor: "#B23A2E", backgroundColor: "color-mix(in srgb, #B23A2E 10%, transparent)" };
          return (
            <button
              key={opt.char}
              onClick={() => choose(opt)}
              disabled={!!picked}
              className="rounded-xl border px-3 py-3 text-center text-sm font-semibold text-ink transition-colors disabled:cursor-default"
              style={style}
            >
              {hintOf(opt)}
            </button>
          );
        })}
      </div>

      {picked && (
        <button onClick={next} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
          <RotateCw className="h-4 w-4" /> Berikutnya
        </button>
      )}
    </div>
  );
}
