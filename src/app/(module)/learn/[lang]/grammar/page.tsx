import { notFound } from "next/navigation";
import { getGrammar, type GrammarPattern } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

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
            <div
              key={i}
              className="rounded-r-lg border-l-2 pl-3"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
            >
              <p className="font-display text-[0.95rem] leading-relaxed text-ink" lang={lang}>{e.native}</p>
              {e.roman && <p className="text-xs text-ink-faint">{e.roman}</p>}
              {e.gloss && <p className="text-xs text-ink-soft">{e.gloss}</p>}
            </div>
          ))}
        </div>
      )}

      {p.notes && (
        <p className="mt-3 rounded-lg bg-paper-2/60 px-3 py-2 text-xs text-ink-soft">
          <span className="font-semibold text-ink">Note:</span> {p.notes}
        </p>
      )}
    </article>
  );
}

export default async function GrammarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const patterns = getGrammar(lang);
  const groups = LEVELS.map((level) => ({
    level,
    items: patterns.filter((p) => (p.level || "").toUpperCase() === level),
  })).filter((g) => g.items.length > 0);
  // Any patterns without a recognized JLPT level go in a trailing group.
  const other = patterns.filter((p) => !LEVELS.includes((p.level || "").toUpperCase()));

  return (
    <div className="fl-enter mx-auto max-w-3xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Grammar
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {patterns.length} patterns{groups.length > 0 ? " across JLPT N5–N1" : ""}, each with examples.
      </p>

      {patterns.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Grammar reference is coming soon for this language.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {groups.map((g) => (
            <section key={g.level}>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="grid h-9 min-w-9 place-items-center rounded-xl px-2 font-display text-sm font-extrabold text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {g.level}
                </span>
                <div className="flex-1">
                  <p className="font-display text-base font-bold text-ink">JLPT {g.level}</p>
                  <p className="text-xs text-ink-soft">{g.items.length} patterns</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {g.items.map((p) => (
                  <GrammarCard key={p.id} p={p} lang={lang} />
                ))}
              </div>
            </section>
          ))}

          {other.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 place-items-center rounded-xl px-3 font-display text-sm font-extrabold text-white" style={{ backgroundColor: "var(--accent)" }}>·</span>
                <p className="font-display text-base font-bold text-ink">More patterns</p>
              </div>
              <div className="flex flex-col gap-3">
                {other.map((p) => (
                  <GrammarCard key={p.id} p={p} lang={lang} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
