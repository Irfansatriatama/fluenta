"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Zap } from "lucide-react";
import { Celebration } from "@/components/lesson/Celebration";
import { awardGameXp } from "@/lib/gameActions";

export type ScrambleItem = { answer: string; hint: string; reading?: string };
type Chip = { id: number; ch: string };

function buildChips(answer: string): Chip[] {
  const chips = answer.split("").map((ch, i) => ({ id: i, ch }));
  for (let i = chips.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chips[i], chips[j]] = [chips[j], chips[i]];
  }
  return chips;
}

// One word. Keyed by index in the parent, so a new word remounts fresh — no
// reset-on-change effect. Only `built` is state; the pool is derived.
function ScrambleRound({ item, lang, onSolved }: { item: ScrambleItem; lang: string; onSolved: () => void }) {
  // Shuffle client-only so SSR and first client render match (no hydration mismatch).
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const initial = useMemo(() => (isClient ? buildChips(item.answer) : []), [item.answer, isClient]);
  const [built, setBuilt] = useState<Chip[]>([]);

  const pool = initial.filter((c) => !built.some((b) => b.id === c.id));
  const full = built.length === item.answer.length;
  const guess = built.map((c) => c.ch).join("");
  const correct = full && guess === item.answer;
  const status = correct ? "correct" : full ? "wrong" : "idle";

  // Advance shortly after the word is completed correctly (timer, not sync setState).
  useEffect(() => {
    if (!correct) return;
    const t = setTimeout(onSolved, 700);
    return () => clearTimeout(t);
  }, [correct, onSolved]);

  return (
    <>
      <p className="mt-1 text-sm text-ink-soft">
        Arti: <span className="font-semibold text-ink">{item.hint}</span>
      </p>

      {/* built answer */}
      <div
        className="mt-5 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3"
        style={{ borderColor: status === "correct" ? "#2f7d53" : status === "wrong" ? "#b23a2e" : "var(--color-edge)" }}
      >
        {built.length === 0 && <span className="text-sm text-ink-faint">Ketuk huruf di bawah</span>}
        {built.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setBuilt((b) => b.filter((_, j) => j !== i))}
            className="grid h-11 min-w-[2.75rem] place-items-center rounded-xl border px-2 font-display text-lg font-bold text-white"
            style={{ backgroundColor: "var(--accent)", borderColor: "var(--accent)" }}
            lang={lang}
          >
            {c.ch}
          </button>
        ))}
      </div>

      {/* pool */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {pool.map((c) => (
          <button
            key={c.id}
            onClick={() => setBuilt((b) => [...b, c])}
            className="grid h-11 min-w-[2.75rem] place-items-center rounded-xl border border-edge bg-paper px-2 font-display text-lg font-bold text-ink shadow-soft transition-transform hover:scale-105"
            lang={lang}
          >
            {c.ch}
          </button>
        ))}
      </div>
    </>
  );
}

export function ScrambleGame({ lang, items }: { lang: string; items: ScrambleItem[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [, startTransition] = useTransition();
  const awarded = useRef(false);
  const item = items[index];

  const onSolved = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= items.length) {
        setFinished(true);
        return i;
      }
      return i + 1;
    });
  }, [items.length]);

  useEffect(() => {
    if (finished && !awarded.current) {
      awarded.current = true;
      startTransition(async () => {
        await awardGameXp(items.length * 3);
      });
    }
  }, [finished, items.length, startTransition]);

  if (finished) {
    return (
      <Celebration
        title="Kerja bagus!"
        stats={[
          { icon: <Shuffle className="h-5 w-5" />, value: items.length, label: "kata terpecah" },
          { icon: <Zap className="h-5 w-5" />, value: items.length * 3, label: "XP", prefix: "+", countUp: true },
        ]}
        continueLabel="Main lagi"
        onContinue={() => router.refresh()}
        secondaryLabel="Kembali ke permainan"
        onSecondary={() => router.push(`/learn/${lang}/games`)}
      />
    );
  }

  if (!item) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold text-ink">Susun Kata</h1>
        <p className="text-sm text-ink-soft">{index + 1}/{items.length}</p>
      </div>
      <ScrambleRound key={index} item={item} lang={lang} onSolved={onSolved} />
    </div>
  );
}
