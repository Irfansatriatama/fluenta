"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GrammarPattern } from "@/lib/staticContent";

export type ParticleGroup = { particle: string; role?: string; desc?: string; examples: { native: string; en: string }[] };
export type LevelGroup = { level: string; items: GrammarPattern[] };

// Each pattern is a collapsed row — you can scan a whole level at a glance and
// open only the one you want, instead of scrolling past every pattern fully
// expanded.
function GrammarRow({ p, lang }: { p: GrammarPattern; lang: string }) {
  return (
    <details className="group rounded-xl border hairline bg-paper shadow-soft [&[open]]:border-[color:var(--accent)]">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="font-display text-lg font-bold text-ink" lang={lang}>{p.pattern}</span>
          {p.reading && <span className="text-xs text-ink-faint" lang={lang}>{p.reading}</span>}
          <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{p.meaning}</span>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t hairline px-4 pb-4 pt-3">
        {p.explanation && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.explanation}</p>
        )}
        {p.examples.length > 0 && (
          <div className="mt-3 flex flex-col gap-2.5">
            {p.examples.map((e, i) => (
              <div key={i} className="rounded-r-lg border-l-2 pl-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>
                <p className="font-display text-[0.95rem] leading-relaxed text-ink" lang={lang}>{e.native}</p>
                {e.roman && <p className="text-xs text-ink-faint">{e.roman}</p>}
                {e.gloss && <p className="text-xs text-ink-soft">{e.gloss}</p>}
              </div>
            ))}
          </div>
        )}
        {p.notes && (
          <p className="mt-3 rounded-lg bg-paper-2/60 px-3 py-2 text-xs text-ink-soft">
            <span className="font-semibold text-ink">Catatan:</span> {p.notes}
          </p>
        )}
      </div>
    </details>
  );
}

function ParticleRow({ pg }: { pg: ParticleGroup }) {
  return (
    <details className="group rounded-xl border hairline bg-paper shadow-soft [&[open]]:border-[color:var(--accent)]">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-2xl font-bold leading-none" style={{ color: "var(--accent)" }} lang="ja">{pg.particle}</span>
        <div className="min-w-0 flex-1">
          {pg.role && <span className="text-sm font-bold text-ink">{pg.role}</span>}
          {pg.desc && <p className="truncate text-xs text-ink-soft">{pg.desc}</p>}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t hairline px-4 pb-4 pt-3">
        <div className="flex flex-col gap-2">
          {pg.examples.map((e, i) => (
            <div key={i} className="rounded-r-lg border-l-2 pl-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>
              <p className="font-display text-[0.95rem] leading-relaxed text-ink" lang="ja">{e.native}</p>
              <p className="text-xs text-ink-soft">{e.en}</p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export function GrammarBrowser({
  lang,
  particles,
  levels,
  other,
}: {
  lang: string;
  particles: ParticleGroup[];
  levels: LevelGroup[];
  other: GrammarPattern[];
}) {
  const tabs = [
    ...(particles.length > 0 ? [{ key: "particles", label: "Partikel" }] : []),
    ...levels.map((g) => ({ key: g.level, label: g.level })),
    ...(other.length > 0 ? [{ key: "other", label: "Lainnya" }] : []),
  ];
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  const activeLevel = levels.find((g) => g.level === active);

  return (
    <div className="mt-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors"
              style={
                on
                  ? { borderColor: "var(--accent)", backgroundColor: "var(--accent)", color: "#fff" }
                  : { borderColor: "var(--color-edge)", color: "var(--color-ink-soft)" }
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        {active === "particles"
          ? `${particles.length} partikel`
          : activeLevel
            ? `${activeLevel.items.length} pola · JLPT ${activeLevel.level}`
            : `${other.length} pola`}{" "}
        — ketuk untuk membuka.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {active === "particles" && particles.map((pg) => <ParticleRow key={pg.particle} pg={pg} />)}
        {activeLevel && activeLevel.items.map((p) => <GrammarRow key={p.id} p={p} lang={lang} />)}
        {active === "other" && other.map((p) => <GrammarRow key={p.id} p={p} lang={lang} />)}
      </div>
    </div>
  );
}
