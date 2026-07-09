"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Lightbulb, Mic, Play, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import { completeLesson } from "@/lib/lessonActions";

export type SpeakToken = { native: string; reading: string };
export type SpeakData = {
  id: string;
  xpReward: number;
  phrase: string;
  reading: string;
  gloss: string;
  tokens: SpeakToken[];
  tip: string;
};

type TokenScore = SpeakToken & { score: number };
type Feedback = { overall: number; tokens: TokenScore[]; supported: boolean };

const SR_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

function strip(s: string) {
  return s.replace(/[。、．，.,!?！？\s]/g, "");
}

// Character-overlap similarity (0–100) — approximate, browser-only.
function similarity(a: string, b: string) {
  const A = strip(a);
  const B = strip(b);
  if (!A.length) return 0;
  const set = new Set(B.split(""));
  let hit = 0;
  for (const ch of A) if (set.has(ch)) hit += 1;
  return Math.round((hit / A.length) * 100);
}

function scoreAttempt(data: SpeakData, transcript: string): Feedback {
  const t = strip(transcript);
  const overall = Math.max(similarity(data.phrase, transcript), similarity(data.reading, transcript));
  const tokens = data.tokens.map((tok) => {
    const present = t.includes(strip(tok.native));
    return { ...tok, score: present ? Math.min(98, 82 + Math.round(overall / 6)) : Math.max(45, overall - 20) };
  });
  return { overall: Math.min(100, overall), tokens, supported: true };
}

function tone(score: number) {
  if (score >= 85) return "#2f7d53";
  if (score >= 65) return "#e8862f";
  return "#b23a2e";
}

export function SpeakRunner({ lang, data }: { lang: string; data: SpeakData }) {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();
  const recRef = useRef<Recognition | null>(null);

  function playReference() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(data.phrase);
    u.lang = SR_LANG[lang] ?? "en-US";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function record() {
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;

    if (!Ctor) {
      setFeedback({ overall: 0, tokens: data.tokens.map((t) => ({ ...t, score: 0 })), supported: false });
      return;
    }

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = SR_LANG[lang] ?? "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    setFeedback(null);
    setListening(true);

    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      setFeedback(scoreAttempt(data, transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  function finish() {
    startTransition(async () => {
      await completeLesson({ lessonId: data.id, correct: 1, total: 1 });
      router.push(`/learn/${lang}/journey`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Speaking / Pronunciation</p>
          <h1 className="mt-1 font-display text-xl font-extrabold text-ink">Say the phrase</h1>
        </div>
        <button onClick={() => router.push(`/learn/${lang}/journey`)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* prompt + mic */}
        <div className="rounded-2xl border hairline bg-paper p-6 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-deep">
            <Sparkles className="h-4 w-4 text-gold" /> Say this phrase
          </p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-bold text-ink" lang={lang}>{data.phrase}</p>
              <p className="mt-1 text-sm text-ink-soft" lang={lang}>{data.reading}</p>
              <p className="mt-1 text-sm text-ink-soft">{data.gloss}</p>
            </div>
            <button onClick={playReference} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-edge text-ink-soft hover:bg-paper-2" aria-label="Play">
              <Volume2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <button
              onClick={record}
              disabled={listening}
              className="grid h-24 w-24 place-items-center rounded-full text-white shadow-lift transition-transform hover:scale-105 disabled:opacity-80"
              style={{ backgroundColor: "var(--accent)" }}
              aria-label="Record"
            >
              <Mic className="h-9 w-9" />
            </button>
            <p className="mt-2 text-xs font-semibold" style={{ color: "var(--accent)" }}>
              {listening ? "Listening…" : "Tap to speak"}
            </p>
            <button onClick={playReference} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
              <Play className="h-4 w-4" /> Play reference
            </button>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-paper-2/60 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p className="text-xs text-ink-soft">{data.tip}</p>
          </div>
        </div>

        {/* feedback */}
        <div className="rounded-2xl border hairline bg-paper p-6 shadow-soft">
          {!feedback ? (
            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center text-sm text-ink-soft">
              <Mic className="h-8 w-8 text-ink-faint" />
              <p className="mt-3">Record yourself to see pronunciation feedback.</p>
            </div>
          ) : !feedback.supported ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-ink-soft">
                Speech recognition isn&apos;t available in this browser. Try Chrome, or mark this as practiced.
              </p>
              <button onClick={finish} disabled={pending} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>
                {pending ? "Saving…" : "Mark as practiced"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    Your pronunciation <Sparkles className="h-4 w-4 text-gold" />
                  </p>
                  <p className="mt-1">
                    <span className="font-display text-4xl font-extrabold" style={{ color: "var(--accent)" }}>{feedback.overall}</span>
                    <span className="text-sm text-ink-soft">/100</span>
                  </p>
                </div>
                <p className="max-w-[9rem] text-xs text-ink-soft">
                  {feedback.overall >= 80 ? "Great — you sounded natural!" : feedback.overall >= 55 ? "Good try — a couple of tweaks." : "Keep practicing — try again."}
                </p>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {feedback.tokens.map((tk, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl border hairline bg-ivory px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-semibold text-ink" lang={lang}>{tk.native}</p>
                      <p className="text-xs text-ink-soft">{tk.reading}</p>
                    </div>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper-2">
                      <div className="h-full rounded-full" style={{ width: `${tk.score}%`, backgroundColor: tone(tk.score) }} />
                    </div>
                    <span className="w-8 text-right text-sm font-bold text-ink">{tk.score}</span>
                    <ChevronDown className="h-4 w-4 text-ink-faint" />
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={record} className="inline-flex items-center justify-center gap-2 rounded-xl border border-edge px-4 py-2.5 text-sm font-bold text-ink hover:border-gold/60">
                  <RotateCcw className="h-4 w-4" /> Try again
                </button>
                <button onClick={finish} disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: "var(--accent)" }}>
                  {pending ? "Saving…" : "Continue"} {!pending && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
