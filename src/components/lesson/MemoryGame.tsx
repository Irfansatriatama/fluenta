"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, HelpCircle, Zap } from "lucide-react";
import { Celebration } from "@/components/lesson/Celebration";
import { awardGameXp } from "@/lib/gameActions";

export type MemoryPair = { cardId: string; front: string; back: string };
type Tile = { key: string; cardId: string; text: string; face: "front" | "back" };

// Two tiles per pair (front + back), shuffled. Module-level so the randomness
// stays out of the component render body.
function buildTiles(pairs: MemoryPair[]): Tile[] {
  const t: Tile[] = pairs.flatMap((p, i) => [
    { key: `f${i}`, cardId: p.cardId, text: p.front, face: "front" },
    { key: `b${i}`, cardId: p.cardId, text: p.back, face: "back" },
  ]);
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export function MemoryGame({ lang, pairs }: { lang: string; pairs: MemoryPair[] }) {
  const router = useRouter();
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [, startTransition] = useTransition();
  const awarded = useRef(false);

  // Tiles are shuffled — build them CLIENT-ONLY (useSyncExternalStore) so the
  // server HTML and first client render match (no Math.random hydration
  // mismatch), with no setState-in-effect.
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const tiles = useMemo<Tile[]>(() => (isClient ? buildTiles(pairs) : []), [pairs, isClient]);

  const done = tiles.length > 0 && matched.size === pairs.length;

  // Award XP once when solved — a real side effect (no setState here).
  useEffect(() => {
    if (done && !awarded.current) {
      awarded.current = true;
      startTransition(async () => {
        await awardGameXp(15);
      });
    }
  }, [done]);

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
        title="Cocok semua!"
        stats={[
          { icon: <Grid3x3 className="h-5 w-5" />, value: moves, label: "langkah" },
          { icon: <Zap className="h-5 w-5" />, value: 15, label: "XP", prefix: "+", countUp: true },
        ]}
        continueLabel="Main lagi"
        onContinue={() => router.refresh()}
        secondaryLabel="Kembali ke permainan"
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
