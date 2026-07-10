"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Languages, Volume2, X } from "lucide-react";
import { completeReading } from "@/lib/readingActions";
import type { ReadingPassage } from "@/lib/staticContent";

const TTS_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

const TYPE_LABEL: Record<string, string> = {
  news: "News",
  conversation: "Conversation",
  story: "Story",
};

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TTS_LANG[lang] ?? "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function ReadingRunner({
  passage,
  lang,
  backHref,
}: {
  passage: ReadingPassage;
  lang: string;
  backHref: string;
}) {
  const router = useRouter();
  const [furigana, setFurigana] = useState(true);
  const [english, setEnglish] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [xp, setXp] = useState(0);
  const [pending, startTransition] = useTransition();

  const q = passage.questions;
  const allAnswered = q.every((_, i) => answers[i] !== undefined);
  const correctCount = q.filter((qu, i) => answers[i] === qu.answer).length;

  function finish() {
    setChecked(true);
    startTransition(async () => {
      const res = await completeReading({ correct: correctCount, total: q.length });
      setXp(res.xp);
      setFinished(true);
    });
  }

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors";

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <BookOpen className="h-4 w-4" style={{ color: "var(--accent)" }} />
          {TYPE_LABEL[passage.type]} · {passage.level} · {passage.minutes} min
        </div>
        <button
          onClick={() => router.push(backHref)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
          aria-label="Exit"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl" lang={lang}>
        {passage.title}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{passage.titleEn}</p>

      {/* reading controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFurigana((v) => !v)}
          className={chip}
          style={furigana ? { borderColor: "var(--accent)", color: "var(--accent)" } : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }}
        >
          あ Furigana
        </button>
        <button
          onClick={() => setEnglish((v) => !v)}
          className={chip}
          style={english ? { borderColor: "var(--accent)", color: "var(--accent)" } : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }}
        >
          <Languages className="h-3.5 w-3.5" /> English
        </button>
        <button onClick={() => speak(passage.blocks.map((b) => b.jp).join(" "), lang)} className={chip} style={{ borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }}>
          <Volume2 className="h-3.5 w-3.5" /> Play all
        </button>
      </div>

      {/* passage */}
      <article className="mt-5 flex flex-col gap-3">
        {passage.blocks.map((b, i) => (
          <div
            key={i}
            className="rounded-2xl border hairline bg-paper p-4 shadow-soft"
          >
            <div className="flex items-start gap-3">
              {b.speaker && (
                <span
                  className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-bold"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
                >
                  {b.speaker}
                </span>
              )}
              <div className="min-w-0 flex-1">
                {furigana && <p className="text-xs text-ink-faint" lang={lang}>{b.reading}</p>}
                <p className="font-display text-lg leading-relaxed text-ink" lang={lang}>{b.jp}</p>
                {english && <p className="mt-1 text-sm text-ink-soft">{b.en}</p>}
              </div>
              <button
                onClick={() => speak(b.jp, lang)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
                aria-label="Play line"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </article>

      {/* vocab */}
      <section className="mt-8">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Vocabulary</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {passage.vocab.map((v, i) => (
            <div key={i} className="flex items-baseline gap-2 rounded-xl border hairline bg-paper px-3 py-2">
              <span className="font-display text-base font-bold text-ink" lang={lang}>{v.word}</span>
              <span className="text-xs text-ink-faint" lang={lang}>{v.reading}</span>
              <span className="ml-auto text-right text-xs text-ink-soft">{v.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      {/* comprehension */}
      <section className="mt-8">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Comprehension</h2>
        <div className="mt-3 flex flex-col gap-5">
          {q.map((qu, qi) => (
            <div key={qi}>
              <p className="font-semibold text-ink" lang={lang}>{qi + 1}. {qu.q}</p>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {qu.options.map((opt, oi) => {
                  const picked = answers[qi] === oi;
                  const isAnswer = qu.answer === oi;
                  let style: React.CSSProperties = { borderColor: "var(--color-edge)" };
                  if (checked && isAnswer) style = { borderColor: "#2F7D53", backgroundColor: "color-mix(in srgb, #2F7D53 10%, transparent)" };
                  else if (checked && picked && !isAnswer) style = { borderColor: "#B23A2E", backgroundColor: "color-mix(in srgb, #B23A2E 10%, transparent)" };
                  else if (picked) style = { borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)" };
                  return (
                    <button
                      key={oi}
                      disabled={checked}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className="rounded-xl border px-4 py-2.5 text-left text-sm text-ink transition-colors disabled:cursor-default"
                      style={style}
                      lang={lang}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {checked && qu.explanation && (
                <p className="mt-2 text-xs text-ink-soft" lang={lang}>{qu.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {!finished ? (
          <button
            onClick={finish}
            disabled={!allAnswered || pending}
            className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {allAnswered ? "Check answers" : "Answer all questions"}
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border p-5 text-center" style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)" }}>
            <p className="font-display text-xl font-extrabold" style={{ color: "var(--accent)" }}>
              {correctCount}/{q.length} correct
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <Check className="h-4 w-4" /> +{xp} XP earned
            </p>
            <button
              onClick={() => {
                router.push(backHref);
                router.refresh();
              }}
              className="mt-4 w-full rounded-xl border border-edge px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-[color:var(--accent)]"
            >
              Back to reading
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
