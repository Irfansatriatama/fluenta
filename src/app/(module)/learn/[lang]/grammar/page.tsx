import { notFound } from "next/navigation";
import { getGrammar } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function GrammarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const patterns = getGrammar(lang);
  const categories = Array.from(new Set(patterns.map((p) => p.category || "General")));

  return (
    <div className="fl-enter mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Grammar
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{patterns.length} patterns with examples.</p>

      {patterns.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Grammar reference is coming soon for this language.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">{cat}</h2>
              <div className="flex flex-col gap-4">
                {patterns
                  .filter((p) => (p.category || "General") === cat)
                  .map((p) => (
                    <article key={p.id} className="rounded-2xl border hairline bg-paper p-5 shadow-soft">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-lg font-bold text-ink" lang={lang}>{p.pattern}</h3>
                        <span className="shrink-0 rounded-full bg-ivory px-2.5 py-0.5 text-xs font-semibold text-ink-soft ring-1 ring-edge">{p.level}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium" style={{ color: "var(--accent)" }}>{p.meaning}</p>
                      {p.explanation && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.explanation}</p>}
                      {p.examples.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-2 border-t border-dashed hairline pt-3">
                          {p.examples.map((e, i) => (
                            <li key={i}>
                              <p className="font-display text-sm text-ink" lang={lang}>{e.native}</p>
                              {e.roman && <p className="text-xs text-ink-faint">{e.roman}</p>}
                              {e.gloss && <p className="text-xs text-ink-soft">{e.gloss}</p>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {p.notes && <p className="mt-3 rounded-lg bg-paper-2/60 px-3 py-2 text-xs text-ink-soft">{p.notes}</p>}
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
