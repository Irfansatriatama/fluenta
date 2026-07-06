"use server";

import { PROGRESS_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

async function updateStreak(userId: string): Promise<number> {
  const today = startOfDay(new Date());
  const s = await prisma.streak.findUnique({ where: { userId } });

  if (!s) {
    await prisma.streak.create({
      data: { userId, current: 1, longest: 1, lastActiveDate: today },
    });
    return 1;
  }

  const last = s.lastActiveDate ? startOfDay(s.lastActiveDate) : null;
  if (last && daysBetween(last, today) === 0) return s.current; // already active today

  const current = last && daysBetween(last, today) === 1 ? s.current + 1 : 1;
  const longest = Math.max(s.longest, current);
  await prisma.streak.update({
    where: { userId },
    data: { current, longest, lastActiveDate: today },
  });
  return current;
}

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
