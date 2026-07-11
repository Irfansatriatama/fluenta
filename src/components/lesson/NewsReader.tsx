"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pause, Volume2, X } from "lucide-react";
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

  // Split into readable paragraphs; drop reference/heading noise.
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
        {article.url && (
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-[color:var(--accent)]" style={{ borderColor: "var(--color-edge)" }}>
            <ExternalLink className="h-3.5 w-3.5" /> Wikinews
          </a>
        )}
      </div>

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
        This is authentic, native-level Japanese. Tap a paragraph&apos;s speaker to hear it, and ask the
        AI Tutor to explain any sentence.
      </p>

      <p className="mt-4 border-t hairline pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        Source: ウィキニュース (Japanese Wikinews), licensed under CC BY 2.5. Text may have been trimmed for display.
      </p>
    </div>
  );
}
