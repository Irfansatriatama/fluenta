"use server";

import { PROGRESS_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateStreak } from "@/lib/streak";

export async function completeLesson(input: {
  lessonId: string;
  correct: number;
  total: number;
}) {
  const session = await requireSession();
  const userId = session.user.id;

  const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });
  if (!lesson) return { ok: false as const };

  const score = input.total > 0 ? Math.round((input.correct / input.total) * 100) : 100;

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });
  const firstCompletion = existing?.status !== PROGRESS_STATUS.COMPLETED;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    create: {
      userId,
      lessonId: lesson.id,
      status: PROGRESS_STATUS.COMPLETED,
      score,
      attempts: 1,
      completedAt: new Date(),
    },
    update: {
      status: PROGRESS_STATUS.COMPLETED,
      score,
      attempts: { increment: 1 },
      completedAt: new Date(),
    },
  });

  const xp = firstCompletion ? lesson.xpReward : 0;
  if (xp > 0) {
    await prisma.xpEvent.create({
      data: { userId, amount: xp, source: "lesson", refId: lesson.id },
    });
  }

  const streakCurrent = await updateStreak(userId);

  return { ok: true as const, xp, streakCurrent, score };
}
