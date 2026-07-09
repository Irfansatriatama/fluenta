"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateStreak } from "@/lib/streak";

// Award a small XP reward for finishing a mini-game.
export async function awardGameXp(amount: number): Promise<{ ok: boolean }> {
  const session = await requireSession();
  const safe = Math.min(30, Math.max(1, Math.round(amount)));
  await prisma.xpEvent.create({ data: { userId: session.user.id, amount: safe, source: "game" } });
  await updateStreak(session.user.id);
  return { ok: true };
}
