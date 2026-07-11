"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Pause, Sparkles, Volume2, X } from "lucide-react";
import { buildNewsExercise, type NewsExercise } from "@/lib/newsExercise";
import { completeReading } from "@/lib/readingActions";
import type { NewsItem } from "@/lib/news";

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

function ExerciseView({ exercise, lang }: { exercise: NewsExercise; lang: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const q = exercise.questions ?? [];
  const allAnswered = q.every((_, i) => answers[i] !== undefined);
  const correct = q.filter((qu, i) => answers[i] === qu.answer).length;

  function check() {
    setChecked(true);
    startTransition(async () => {
      const res = await completeReading({ correct, total: q.length });
      setXp(res.xp);
    });
  }

  return (
    <div className="mt-8 rounded-3xl border p-5 shadow-soft" style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}>
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
        <Sparkles className="h-3.5 w-3.5" /> Easy version
      </p>

      {/* simplified Japanese with furigana + audio */}
      <div className="mt-3 flex flex-col gap-2">
        {exercise.easy?.map((b, i) => (
          <div key={i} className="flex items-start gap-2 rounded-2xl border hairline bg-paper p-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-base leading-relaxed text-ink" lang={lang}>{b.jp}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{b.en}</p>
            </div>
            <button onClick={() => speak(b.jp)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Play">
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* vocab */}
      {exercise.vocab?.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Vocabulary</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {exercise.vocab.map((v, i) => (
              <div key={i} className="flex items-baseline gap-2 rounded-xl border hairline bg-paper px-3 py-2">
                <span className="font-display text-base font-bold text-ink" lang={lang}>{v.word}</span>
                <span className="text-xs text-ink-faint" lang={lang}>{v.reading}</span>
                <span className="ml-auto text-right text-xs text-ink-soft">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* comprehension */}
      {q.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Comprehension</p>
          <div className="mt-2 flex flex-col gap-4">
            {q.map((qu, qi) => (
              <div key={qi}>
                <p className="font-semibold text-ink" lang={lang}>{qi + 1}. {qu.q}</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {qu.options.map((opt, oi) => {
                    const picked = answers[qi] === oi;
                    const isAns = qu.answer === oi;
                    let style: React.CSSProperties = { borderColor: "var(--color-edge)" };
                    if (checked && isAns) style = { borderColor: "#2F7D53", backgroundColor: "color-mix(in srgb, #2F7D53 10%, transparent)" };
                    else if (checked && picked && !isAns) style = { borderColor: "#B23A2E", backgroundColor: "color-mix(in srgb, #B23A2E 10%, transparent)" };
                    else if (picked) style = { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)" };
                    return (
                      <button key={oi} disabled={checked} onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))} className="rounded-xl border px-4 py-2.5 text-left text-sm text-ink transition-colors disabled:cursor-default" style={style} lang={lang}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {checked && qu.explanation && <p className="mt-1.5 text-xs text-ink-soft" lang={lang}>{qu.explanation}</p>}
              </div>
            ))}
          </div>

          {!checked ? (
            <button onClick={check} disabled={!allAnswered} className="mt-5 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: "var(--accent)" }}>
              {allAnswered ? "Check answers" : "Answer all questions"}
            </button>
          ) : (
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Check className="h-4 w-4" style={{ color: "var(--accent)" }} /> {correct}/{q.length} correct{xp !== null ? ` · +${xp} XP` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function NewsReader({
  article,
  backHref,
  lang,
}: {
  article: NewsItem;
  backHref: string;
  lang: string;
}) {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [exercise, setExercise] = useState<NewsExercise | null>(null);
  const [exState, setExState] = useState<"idle" | "loading" | "unavailable" | "error">("idle");
  const [, startTransition] = useTransition();

  const paragraphs = article.extract
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^(出典|関連|参考|脚注|カテゴリ)/.test(p));

  function playAll() {
    if (playing) {
      window.speechSynthesis?.cancel();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speak(paragraphs.join(" "), () => setPlaying(false));
  }

  function study() {
    setExState("loading");
    startTransition(async () => {
      const res = await buildNewsExercise(article.pageid);
      if (!res.available) setExState("unavailable");
      else if (!res.exercise) setExState("error");
      else {
        setExercise(res.exercise);
        setExState("idle");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          News · Authentic (native level)
        </span>
        <button onClick={() => router.push(backHref)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Exit">
          <X className="h-5 w-5" />
        </button>
      </div>

      <h1 className="mt-3 font-display text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl" lang={lang}>
        {article.title}
      </h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={playAll} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-[color:var(--accent)]" style={{ borderColor: "var(--color-edge)" }}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {playing ? "Stop" : "Play all"}
        </button>
        <button onClick={study} disabled={exState === "loading" || !!exercise} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
          <Sparkles className="h-3.5 w-3.5" />
          {exState === "loading" ? "Preparing…" : exercise ? "Lesson ready" : "Study this article"}
        </button>
        {article.url && (
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-[color:var(--accent)]" style={{ borderColor: "var(--color-edge)" }}>
            <ExternalLink className="h-3.5 w-3.5" /> Wikinews
          </a>
        )}
      </div>

      {exState === "unavailable" && (
        <p className="mt-3 rounded-xl bg-paper-2 px-4 py-2.5 text-xs text-ink-soft">
          The auto-lesson needs an AI key (e.g. GROQ_API_KEY). You can still read the article with audio below.
        </p>
      )}
      {exState === "error" && (
        <p className="mt-3 rounded-xl bg-paper-2 px-4 py-2.5 text-xs text-ink-soft">Couldn&apos;t build a lesson just now — please try again.</p>
      )}

      {exercise && <ExerciseView exercise={exercise} lang={lang} />}

      <article className="mt-5 flex flex-col gap-3">
        {paragraphs.map((p, i) => (
          <div key={i} className="group flex items-start gap-2 rounded-2xl border hairline bg-paper p-4 shadow-soft">
            <p className="min-w-0 flex-1 font-display text-lg leading-loose text-ink" lang={lang}>{p}</p>
            <button onClick={() => speak(p)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper-2" aria-label="Play paragraph">
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </article>

      <p className="mt-6 rounded-xl bg-paper-2 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        This is authentic, native-level Japanese. Tap &quot;Study this article&quot; for an easy version with
        vocabulary and a quiz, or ask the AI Tutor to explain any sentence.
      </p>

      <p className="mt-4 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        Source: ウィキニュース (Japanese Wikinews), licensed under CC BY 2.5. The easy version is AI-generated from the article.
      </p>
    </div>
  );
}
