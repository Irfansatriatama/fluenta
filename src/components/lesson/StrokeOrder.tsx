"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Volume2, X } from "lucide-react";

export type StrokeGroup = { title: string; chars: string[] };

const STROKE_MS = 520;
const GAP_MS = 140;

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function StrokePlayer({ char, paths }: { char: string; paths: string[] }) {
  const ref = useRef<SVGSVGElement>(null);

  const play = useCallback(() => {
    const svg = ref.current;
    if (!svg) return;
    const els = Array.from(svg.querySelectorAll<SVGPathElement>(".stroke-anim"));
    els.forEach((el, i) => {
      el.animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: STROKE_MS, delay: i * (STROKE_MS + GAP_MS), fill: "forwards", easing: "ease-in-out" },
      );
    });
  }, []);

  useEffect(() => {
    play();
  }, [char, paths, play]);

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={ref}
        viewBox="0 0 109 109"
        className="h-56 w-56"
        style={{ background: "var(--color-paper, #fff)" }}
      >
        {/* grid guides */}
        <g stroke="var(--color-edge)" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.7">
          <line x1="54.5" y1="0" x2="54.5" y2="109" />
          <line x1="0" y1="54.5" x2="109" y2="54.5" />
        </g>
        {/* faint full character as a target */}
        <g fill="none" stroke="var(--color-ink-faint)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.25">
          {paths.map((d, i) => (
            <path key={`bg-${i}`} d={d} />
          ))}
        </g>
        {/* animated strokes */}
        <g fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {paths.map((d, i) => (
            <path
              key={`fg-${i}`}
              className="stroke-anim"
              d={d}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          ))}
        </g>
      </svg>

      <p className="mt-1 text-xs text-ink-soft">{paths.length} strokes</p>
      <div className="mt-3 flex gap-2">
        <button onClick={play} className="inline-flex items-center gap-1.5 rounded-xl border border-edge px-4 py-2 text-sm font-bold text-ink hover:border-[color:var(--accent)]">
          <RotateCcw className="h-4 w-4" /> Replay
        </button>
        <button onClick={() => speak(char)} className="inline-flex items-center gap-1.5 rounded-xl border border-edge px-4 py-2 text-sm font-bold text-ink hover:border-[color:var(--accent)]">
          <Volume2 className="h-4 w-4" /> Sound
        </button>
      </div>
    </div>
  );
}

export function StrokeOrder({ groups }: { groups: StrokeGroup[] }) {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [paths, setPaths] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const open = useCallback(async (char: string) => {
    setSelected(char);
    setPaths(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/strokes?c=${encodeURIComponent(char)}`);
      const data = (await res.json()) as { paths: string[] | null };
      setPaths(data.paths);
    } finally {
      setLoading(false);
    }
  }, []);

  const group = groups[tab];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {groups.map((g, i) => (
          <button
            key={g.title}
            onClick={() => setTab(i)}
            className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
            style={i === tab ? { borderColor: "var(--accent)", color: "var(--accent)" } : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }}
          >
            {g.title} ({g.chars.length})
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
        {group?.chars.map((c) => (
          <button
            key={c}
            onClick={() => open(c)}
            className="grid aspect-square place-items-center rounded-xl border hairline bg-paper font-display text-2xl font-bold text-ink shadow-soft transition-colors hover:border-[color:var(--accent)]"
            lang="ja"
          >
            {c}
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border hairline bg-paper p-6 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-2"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-center font-display text-3xl font-extrabold text-ink" lang="ja">{selected}</p>
            <div className="mt-3">
              {loading && <p className="py-16 text-center text-sm text-ink-soft">Loading…</p>}
              {!loading && paths && <StrokePlayer char={selected} paths={paths} />}
              {!loading && !paths && (
                <p className="py-16 text-center text-sm text-ink-soft">Stroke data not available for this character yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
