import { notFound } from "next/navigation";
import { getCharacters } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const groups = getCharacters(lang);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Characters
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Writing systems, readings, and examples.</p>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          {meta.name} uses the Latin alphabet — no separate character set to study here.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                {group.title} <span className="text-ink-faint">({group.items.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((c, i) => (
                  <div key={i} className="rounded-2xl border hairline bg-paper p-4 shadow-soft">
                    <p className="font-display text-3xl font-bold text-ink" lang={lang}>{c.char}</p>
                    {c.sub && <p className="mt-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>{c.sub}</p>}
                    {c.meaning && <p className="mt-0.5 truncate text-xs text-ink-soft">{c.meaning}</p>}
                    {c.example && <p className="mt-1 truncate text-[0.65rem] text-ink-faint" lang={lang}>{c.example}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
