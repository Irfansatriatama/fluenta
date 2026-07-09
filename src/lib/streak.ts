import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

// Advances the user's daily streak. Idempotent within the same day.
export async function updateStreak(userId: string): Promise<number> {
  const today = startOfDay(new Date());
  const s = await prisma.streak.findUnique({ where: { userId } });

  if (!s) {
    await prisma.streak.create({ data: { userId, current: 1, longest: 1, lastActiveDate: today } });
    return 1;
  }

  const last = s.lastActiveDate ? startOfDay(s.lastActiveDate) : null;
  if (last && daysBetween(last, today) === 0) return s.current;

  const current = last && daysBetween(last, today) === 1 ? s.current + 1 : 1;
  const longest = Math.max(s.longest, current);
  await prisma.streak.update({ where: { userId }, data: { current, longest, lastActiveDate: today } });
  return current;
}
