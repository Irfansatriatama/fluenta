import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoryGame } from "@/components/lesson/MemoryGame";
import { prisma } from "@/lib/prisma";
import { getLanguage } from "@/lib/theme";

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const language = await prisma.language.findUnique({ where: { code: lang } });
  const decks = language
    ? await prisma.deck.findMany({ where: { languageId: language.id, isSystem: true }, select: { id: true } })
    : [];
  const cards = await prisma.card.findMany({ where: { deckId: { in: decks.map((d) => d.id) } } });

  const pairs = cards
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map((c) => ({ cardId: c.id, front: c.front, back: c.back }));

  if (pairs.length < 2) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-ink-soft">Not enough vocabulary yet to play.</p>
        <Link href={`/learn/${lang}/games`} className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>Back</Link>
      </div>
    );
  }

  return <MemoryGame lang={lang} pairs={pairs} />;
}
