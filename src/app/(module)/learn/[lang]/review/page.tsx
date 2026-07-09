import Link from "next/link";
import { notFound } from "next/navigation";
import { FlashcardRunner } from "@/components/lesson/FlashcardRunner";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLanguage } from "@/lib/theme";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const meta = getLanguage(lang);
  if (!meta) notFound();

  const session = await getSession();
  const language = await prisma.language.findUnique({ where: { code: lang } });

  const due = language
    ? await prisma.cardReview.findMany({
        where: { userId: session!.user.id, dueAt: { lte: new Date() } },
        include: { card: { include: { deck: true } } },
        orderBy: { dueAt: "asc" },
        take: 80,
      })
    : [];

  const cards = due
    .filter((r) => r.card.deck.languageId === language!.id)
    .slice(0, 30)
    .map((r) => ({
      id: r.card.id,
      front: r.card.front,
      back: r.card.back,
      reading: r.card.reading,
      example: r.card.example,
    }));

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">All caught up!</h1>
        <p className="mt-2 text-sm text-ink-soft">No cards are due for review right now.</p>
        <Link
          href={`/learn/${lang}/vocab`}
          className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Study vocabulary
        </Link>
      </div>
    );
  }

  return (
    <FlashcardRunner lang={lang} title="Review" cards={cards} backHref={`/learn/${lang}`} />
  );
}
