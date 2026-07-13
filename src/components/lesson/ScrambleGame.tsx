"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Zap } from "lucide-react";
import { Celebration } from "@/components/lesson/Celebration";
import { awardGameXp } from "@/lib/gameActions";

export type ScrambleItem = { answer: string; hint: string; reading?: string };
type Chip = { id: number; ch: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ScrambleGame({ lang, items }: { lang: string; items: ScrambleItem[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [pool, setPool] = useState<Chip[]>([]);
  const [built, setBuilt] = useState<Chip[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [finished, setFinished] = useState(false);
  const [, startTransition] = useTransition();

  const item = items[index];

  useEffect(() => {
    if (!item) return;
    const chips = item.answer.split("").map((ch, i) => ({ id: i, ch }));
    setPool(shuffle(chips));
    setBuilt([]);
    setStatus("idle");
  }, [index, item]);

  useEffect(() => {
    if (!item || built.length !== item.answer.length) {
      setStatus("idle");
      return;
    }
    const guess = built.map((c) => c.ch).join("");
    if (guess === item.answer) {
      setStatus("correct");
      const t = setTimeout(() => {
        if (index + 1 >= items.length) {
          setFinished(true);
          startTransition(async () => {
            await awardGameXp(items.length * 3);
          });
        } else {
          setIndex((i) => i + 1);
        }
      }, 700);
      return () => clearTimeout(t);
    }
    setStatus("wrong");
  }, [built, item, index, items.length]);

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
        <h1 className="font-display text-xl font-extrabold text-ink">Word Scramble</h1>
        <p className="text-sm text-ink-soft">{index + 1}/{items.length}</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Meaning: <span className="font-semibold text-ink">{item.hint}</span>
      </p>

      {/* built answer */}
      <div
        className="mt-5 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3"
        style={{ borderColor: status === "correct" ? "#2f7d53" : status === "wrong" ? "#b23a2e" : "var(--color-edge)" }}
      >
        {built.length === 0 && <span className="text-sm text-ink-faint">Tap the letters below</span>}
        {built.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              setBuilt((b) => b.filter((_, j) => j !== i));
              setPool((p) => [...p, c]);
            }}
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
            onClick={() => {
              setPool((p) => p.filter((x) => x.id !== c.id));
              setBuilt((b) => [...b, c]);
            }}
            className="grid h-11 min-w-[2.75rem] place-items-center rounded-xl border border-edge bg-paper px-2 font-display text-lg font-bold text-ink shadow-soft transition-transform hover:scale-105"
            lang={lang}
          >
            {c.ch}
          </button>
        ))}
      </div>
    </div>
  );
}
