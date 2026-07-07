import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PROGRESS_STATUS } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const EMAIL = "demo@fluenta.app";

async function main() {
  const user = await prisma.user.findFirst({ where: { email: EMAIL } });
  if (!user) {
    console.log(`No user ${EMAIL} — sign up first.`);
    return;
  }
  const userId = user.id;

  await prisma.profile.upsert({
    where: { userId },
    create: { userId, displayName: user.name, dailyGoalMinutes: 15, onboardedAt: new Date() },
    update: { onboardedAt: new Date() },
  });

  const ja = await prisma.language.findUnique({ where: { code: "ja" } });
  const track = ja
    ? await prisma.track.findFirst({ where: { languageId: ja.id }, orderBy: { sortOrder: "asc" } })
    : null;

  if (ja) {
    await prisma.enrollment.upsert({
      where: { userId_languageId: { userId, languageId: ja.id } },
      create: { userId, languageId: ja.id, trackId: track?.id ?? null, currentLevel: "Beginner" },
      update: { trackId: track?.id ?? null },
    });
  }

  await prisma.streak.upsert({
    where: { userId },
    create: { userId, current: 3, longest: 3, lastActiveDate: new Date() },
    update: { current: 3, longest: 3, lastActiveDate: new Date() },
  });

  // Complete the first Japanese reading lesson
  const lessonId = "l-ja-read1";
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (lesson) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, status: PROGRESS_STATUS.COMPLETED, score: 100, attempts: 1, completedAt: new Date() },
      update: { status: PROGRESS_STATUS.COMPLETED, score: 100 },
    });
    const already = await prisma.xpEvent.findFirst({ where: { userId, refId: lessonId } });
    if (!already) {
      await prisma.xpEvent.create({ data: { userId, amount: lesson.xpReward, source: "lesson", refId: lessonId } });
    }
  }

  console.log(`Demo account ${EMAIL} enriched (JP enrolled, streak, 1 lesson done).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
