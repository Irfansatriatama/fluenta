import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLanguage } from "@/lib/theme";

export default async function VocabPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const language = await prisma.language.findUnique({ where: { code: lang } });
  const decks = language
    ? await prisma.deck.findMany({
        where: { languageId: language.id, isSystem: true },
        include: { _count: { select: { cards: true } } },
        orderBy: { title: "asc" },
      })
    : [];

  return (
    <div className="fl-enter mx-auto max-w-4xl">
      <h1 className="fl-heading font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {meta.name} Vocabulary
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Study word decks with spaced-repetition flashcards.</p>

      {decks.length === 0 ? (
        <p className="mt-8 rounded-2xl border hairline bg-paper p-6 text-sm text-ink-soft">
          Vocabulary decks are coming soon for this language.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/learn/${lang}/vocab/${deck.id}`}
              className="flex items-center gap-4 rounded-2xl border hairline bg-paper p-5 shadow-soft transition-colors hover:border-[color:var(--accent)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ivory ring-1 ring-edge" style={{ color: "var(--accent)" }}>
                <Layers className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-ink">{deck.title}</p>
                <p className="text-xs text-ink-soft">{deck._count.cards} cards</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
