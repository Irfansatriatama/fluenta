"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateStreak } from "@/lib/streak";

// SM-2-lite spaced repetition update for one flashcard.
export async function reviewCard(input: {
  cardId: string;
  quality: "again" | "good";
}): Promise<{ ok: boolean }> {
  const session = await requireSession();
  const userId = session.user.id;

  const card = await prisma.card.findUnique({ where: { id: input.cardId } });
  if (!card) return { ok: false };

  const existing = await prisma.cardReview.findUnique({
    where: { userId_cardId: { userId, cardId: input.cardId } },
  });

  let ease = existing?.ease ?? 2.5;
  let reps = existing?.reps ?? 0;
  let lapses = existing?.lapses ?? 0;
  let intervalDays = existing?.intervalDays ?? 0;

  if (input.quality === "again") {
    reps = 0;
    lapses += 1;
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    ease = Math.min(3.0, ease + 0.1);
    intervalDays = reps === 1 ? 1 : reps === 2 ? 3 : Math.max(1, Math.round(intervalDays * ease));
  }

  const dueAt = new Date(Date.now() + intervalDays * 86_400_000);

  await prisma.cardReview.upsert({
    where: { userId_cardId: { userId, cardId: input.cardId } },
    create: { userId, cardId: input.cardId, ease, reps, lapses, intervalDays, dueAt, lastReviewedAt: new Date() },
    update: { ease, reps, lapses, intervalDays, dueAt, lastReviewedAt: new Date() },
  });

  // Award XP once, on the first review of a card; keep the streak alive.
  if (!existing) {
    await prisma.xpEvent.create({ data: { userId, amount: 5, source: "review", refId: input.cardId } });
    await updateStreak(userId);
  }

  return { ok: true };
}
