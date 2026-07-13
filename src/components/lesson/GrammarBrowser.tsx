"use client";

import { useState } from "react";
import type { GrammarPattern } from "@/lib/staticContent";

export type ParticleGroup = { particle: string; role?: string; desc?: string; examples: { native: string; en: string }[] };
export type LevelGroup = { level: string; items: GrammarPattern[] };

function GrammarCard({ p, lang }: { p: GrammarPattern; lang: string }) {
  return (
    <article className="rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold text-ink" lang={lang}>{p.pattern}</h3>
          {p.reading && <p className="text-xs text-ink-faint" lang={lang}>{p.reading}</p>}
        </div>
        {p.category && (
          <span className="shrink-0 rounded-full bg-ivory px-2.5 py-1 text-[0.65rem] font-semibold text-ink-soft ring-1 ring-edge">
            {p.category}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>{p.meaning}</p>
      {p.explanation && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.explanation}</p>
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
    </article>
  );
}

// Grammar is a lot of content. Rather than one endless scroll of every pattern
// expanded, tabs show one level (or particles) at a time — the thing you came
// for is one tap away, not a deep scroll.
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

      <div className="mt-6">
        {active === "particles" && (
          <div className="flex flex-col gap-3">
            {particles.map((pg) => (
              <article key={pg.particle} className="rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold" style={{ color: "var(--accent)" }} lang="ja">{pg.particle}</span>
                  {pg.role && <span className="rounded-full bg-ivory px-2.5 py-1 text-[0.65rem] font-semibold text-ink-soft ring-1 ring-edge">{pg.role}</span>}
                </div>
                {pg.desc && <p className="mt-2 text-sm text-ink-soft">{pg.desc}</p>}
                <div className="mt-3 flex flex-col gap-2">
                  {pg.examples.map((e, i) => (
                    <div key={i} className="rounded-r-lg border-l-2 pl-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}>
                      <p className="font-display text-[0.95rem] leading-relaxed text-ink" lang="ja">{e.native}</p>
                      <p className="text-xs text-ink-soft">{e.en}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {levels.map(
          (g) =>
            active === g.level && (
              <div key={g.level} className="flex flex-col gap-3">
                <p className="mb-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{g.items.length} pola</span> di JLPT {g.level}
                </p>
                {g.items.map((p) => (
                  <GrammarCard key={p.id} p={p} lang={lang} />
                ))}
              </div>
            ),
        )}

        {active === "other" && (
          <div className="flex flex-col gap-3">
            {other.map((p) => (
              <GrammarCard key={p.id} p={p} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
