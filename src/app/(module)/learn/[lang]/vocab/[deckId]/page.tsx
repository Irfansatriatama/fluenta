import { notFound } from "next/navigation";
import { FlashcardRunner } from "@/components/lesson/FlashcardRunner";
import { prisma } from "@/lib/prisma";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ lang: string; deckId: string }>;
}) {
  const { lang, deckId } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      language: true,
      cards: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!deck || deck.language.code !== lang) notFound();

  return (
    <FlashcardRunner
      lang={lang}
      title={deck.title}
      backHref={`/learn/${lang}/vocab`}
      cards={deck.cards.map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        reading: c.reading,
        example: c.example,
      }))}
    />
  );
}
