"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Check, RotateCw, Volume2, X } from "lucide-react";
import { reviewCard } from "@/lib/cardActions";
import { completeLesson } from "@/lib/lessonActions";

export type FlashCard = {
  id: string;
  front: string;
  back: string;
  reading: string | null;
  example: string | null;
};

const TTS_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TTS_LANG[lang] ?? "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function FlashcardRunner({
  lang,
  title,
  cards,
  backHref,
  lessonId,
}: {
  lang: string;
  title: string;
  cards: FlashCard[];
  backHref: string;
  lessonId?: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [done, setDone] = useState(0);
  const [pending, startTransition] = useTransition();

  const total = cards.length;
  const card = cards[index];
  const finished = index >= total;

  // When a flashcard set is a journey lesson, mark it complete on finish.
  useEffect(() => {
    if (finished && lessonId && total > 0) {
      startTransition(async () => {
        await completeLesson({ lessonId, correct: done, total });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const answer = useCallback(
    (quality: "again" | "good") => {
      if (!card) return;
      startTransition(async () => {
        await reviewCard({ cardId: card.id, quality });
        setDone((d) => d + 1);
        setFlipped(false);
        setIndex((i) => i + 1);
      });
    },
    [card],
  );

  // Keyboard shortcuts: Space/Enter flip; when revealed 1/← = still learning, 2/→ = know it; P plays audio.
  useEffect(() => {
    if (finished || total === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key.toLowerCase() === "p") {
        speak(card.front, lang);
      } else if (flipped && !pending) {
        if (e.key === "1" || e.key === "ArrowLeft") answer("again");
        if (e.key === "2" || e.key === "ArrowRight") answer("good");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, pending, finished, total, card, lang, answer]);

  if (total === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-ink-soft">No cards to review right now.</p>
        <button onClick={() => router.push(backHref)} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>
          Back
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl font-extrabold" style={{ color: "var(--accent)" }}>Nice work!</h1>
        <p className="mt-2 text-sm text-ink-soft">You reviewed {done} card{done === 1 ? "" : "s"}.</p>
        <button
          onClick={() => {
            router.push(backHref);
            router.refresh();
          }}
          className="mt-8 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Done
        </button>
      </div>
    );
  }

  // The "native" face (word/char + reading + example) and the "meaning" face.
  const nativeFace = (
    <div>
      {card.reading && <p className="text-base text-ink-soft" lang={lang}>{card.reading}</p>}
      <p className="mt-1 font-display text-5xl font-bold leading-tight text-ink" lang={lang}>{card.front}</p>
      {card.example && <p className="mt-4 whitespace-pre-line text-sm text-ink-soft" lang={lang}>{card.example}</p>}
    </div>
  );
  const meaningFace = <p className="font-display text-2xl font-bold text-ink">{card.back}</p>;
  const frontFace = reverse ? meaningFace : nativeFace;
  const backFace = reverse ? nativeFace : meaningFace;

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${(index / total) * 100}%`, backgroundColor: "var(--accent)" }} />
        </div>
        <span className="text-xs font-semibold text-ink-soft">
          {index + 1}/{total}
        </span>
        <button
          onClick={() => setReverse((r) => !r)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-ink-soft hover:bg-paper-2"
          style={reverse ? { color: "var(--accent)" } : undefined}
          aria-label="Toggle reverse mode"
          title="Reverse: meaning → word"
        >
          <ArrowLeftRight className="h-4 w-4" />
          {reverse ? "Meaning→Word" : "Word→Meaning"}
        </button>
        <button onClick={() => router.push(backHref)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit">
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</p>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="relative mt-8 w-full select-none rounded-3xl border bg-paper px-8 pb-10 pt-9 text-center shadow-lift transition-colors"
        style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)" }}
      >
        {/* spiral notebook binding */}
        <span className="pointer-events-none absolute inset-x-0 -top-3 flex justify-center gap-2.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="h-5 w-3.5 rounded-full border-2 bg-ivory"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
            />
          ))}
        </span>

        {/* audio — pronounce the native word/char (stops the flip) */}
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            speak(card.front, lang);
          }}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-2"
          aria-label="Play pronunciation"
        >
          <Volume2 className="h-5 w-5" />
        </span>

        <div className="grid min-h-[13rem] place-items-center">
          {!flipped ? (
            <div>
              {frontFace}
              <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-faint">
                <RotateCw className="h-3.5 w-3.5" /> Tap or press Space to flip
              </p>
            </div>
          ) : (
            backFace
          )}
        </div>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => answer("again")}
          disabled={!flipped || pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-edge px-4 py-3 text-sm font-bold text-jp transition-colors hover:border-jp/50 disabled:opacity-40"
        >
          <RotateCw className="h-4 w-4" /> Still learning
        </button>
        <button
          onClick={() => answer("good")}
          disabled={!flipped || pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Check className="h-4 w-4" /> Know it
        </button>
      </div>
    </div>
  );
}
