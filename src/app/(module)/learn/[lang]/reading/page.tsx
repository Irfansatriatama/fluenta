import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, MessagesSquare, Newspaper, ScrollText } from "lucide-react";
import { getReading } from "@/lib/staticContent";
import { getLanguage } from "@/lib/theme";

const TYPE_ICON = {
  news: Newspaper,
  conversation: MessagesSquare,
  story: ScrollText,
} as const;

const LEVEL_ORDER = ["N5", "N4", "N3", "N2", "N1"];

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const passages = getReading(lang);
  const levels = LEVEL_ORDER.filter((lv) => passages.some((p) => p.level === lv));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Reading
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Graded passages — news, conversations, and short stories with furigana, audio, and comprehension checks.
      </p>

      {passages.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Reading passages are coming soon for this language.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {levels.map((level) => (
            <section key={level}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                JLPT {level}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {passages
                  .filter((p) => p.level === level)
                  .map((p) => {
                    const Icon = TYPE_ICON[p.type] ?? BookOpen;
                    return (
                      <Link
                        key={p.id}
                        href={`/learn/${lang}/reading/${p.id}`}
                        className="flex items-start gap-3 rounded-2xl border hairline bg-paper p-4 shadow-soft transition-colors hover:border-[color:var(--accent)]"
                      >
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ivory ring-1 ring-edge"
                          style={{ color: "var(--accent)" }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-bold text-ink" lang={lang}>
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-ink-soft">{p.titleEn}</p>
                          <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-ink-faint">
                            {p.topic} · {p.minutes} min
                          </p>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
