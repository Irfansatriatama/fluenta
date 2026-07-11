"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, HelpCircle, Zap } from "lucide-react";
import { Celebration } from "@/components/lesson/Celebration";
import { awardGameXp } from "@/lib/gameActions";

export type MemoryPair = { cardId: string; front: string; back: string };
type Tile = { key: string; cardId: string; text: string; face: "front" | "back" };

export function MemoryGame({ lang, pairs }: { lang: string; pairs: MemoryPair[] }) {
  const router = useRouter();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const t: Tile[] = pairs.flatMap((p, i) => [
      { key: `f${i}`, cardId: p.cardId, text: p.front, face: "front" },
      { key: `b${i}`, cardId: p.cardId, text: p.back, face: "back" },
    ]);
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    setTiles(t);
  }, [pairs]);

  useEffect(() => {
    if (tiles.length > 0 && matched.size === pairs.length && !done) {
      setDone(true);
      startTransition(async () => {
        await awardGameXp(15);
      });
    }
  }, [matched, tiles.length, pairs.length, done]);

  function click(idx: number) {
    if (flipped.length === 2) return;
    const tile = tiles[idx];
    if (matched.has(tile.cardId) || flipped.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (tiles[a].cardId === tiles[b].cardId) {
        setMatched((m) => new Set(m).add(tiles[a].cardId));
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  if (done) {
    return (
      <Celebration
        title="Matched!"
        stats={[
          { icon: <Grid3x3 className="h-5 w-5" />, value: moves, label: "moves" },
          { icon: <Zap className="h-5 w-5" />, value: 15, label: "XP", prefix: "+", countUp: true },
        ]}
        continueLabel="Play again"
        onContinue={() => router.refresh()}
        secondaryLabel="Back to games"
        onSecondary={() => router.push(`/learn/${lang}/games`)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold text-ink">Memory Match</h1>
        <p className="text-sm text-ink-soft">Moves: {moves}</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">Match each word with its meaning.</p>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {tiles.map((tile, idx) => {
          const isMatched = matched.has(tile.cardId);
          const isFlipped = flipped.includes(idx);
          const show = isMatched || isFlipped;
          return (
            <button
              key={tile.key}
              onClick={() => click(idx)}
              className="grid aspect-square place-items-center rounded-2xl border p-2 text-center text-sm font-semibold transition-colors"
              style={
                show
                  ? { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", color: "var(--color-ink)", opacity: isMatched ? 0.55 : 1 }
                  : { borderColor: "var(--color-edge)", backgroundColor: "var(--color-paper)" }
              }
              lang={show && tile.face === "front" ? lang : undefined}
            >
              {show ? (
                <span className={tile.face === "front" ? "font-display text-base" : "text-xs"}>{tile.text}</span>
              ) : (
                <HelpCircle className="h-6 w-6 text-ink-faint" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
