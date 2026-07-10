"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateStreak } from "@/lib/streak";

// Award XP for finishing a reading passage's comprehension check.
// Scales a little with the score but stays bounded.
export async function completeReading({
  correct,
  total,
}: {
  correct: number;
  total: number;
}): Promise<{ ok: boolean; xp: number }> {
  const session = await requireSession();
  const base = 10;
  const bonus = total > 0 ? Math.round((correct / total) * 15) : 0;
  const xp = Math.min(30, base + bonus);
  await prisma.xpEvent.create({
    data: { userId: session.user.id, amount: xp, source: "reading" },
  });
  await updateStreak(session.user.id);
  return { ok: true, xp };
}
