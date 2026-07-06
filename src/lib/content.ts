import { prisma } from "@/lib/prisma";
import { PROGRESS_STATUS } from "@/lib/constants";

export type LessonState = "completed" | "current" | "locked";

export type LessonNode = {
  id: string;
  title: string;
  kind: string;
  xpReward: number;
  state: LessonState;
};

export type UnitNode = {
  id: string;
  title: string;
  lessons: LessonNode[];
};

export type ModuleData = {
  trackTitle: string;
  units: UnitNode[];
  completed: number;
  total: number;
  nextLessonId: string | null;
};

// Loads a language's track with lessons annotated by the user's progress.
// Lessons unlock sequentially: a lesson is playable once the previous is done.
export async function getModuleData(
  langCode: string,
  userId: string,
): Promise<ModuleData | null> {
  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) return null;

  const track = await prisma.track.findFirst({
    where: { languageId: language.id },
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!track) return { trackTitle: "", units: [], completed: 0, total: 0, nextLessonId: null };

  const lessonIds = track.units.flatMap((u) => u.lessons.map((l) => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds } },
  });
  const doneSet = new Set(
    progress.filter((p) => p.status === PROGRESS_STATUS.COMPLETED).map((p) => p.lessonId),
  );

  let prevCompleted = true;
  let completed = 0;
  let nextLessonId: string | null = null;

  const units: UnitNode[] = track.units.map((u) => ({
    id: u.id,
    title: u.title,
    lessons: u.lessons.map((l) => {
      let state: LessonState;
      if (doneSet.has(l.id)) {
        state = "completed";
        completed += 1;
        prevCompleted = true;
      } else if (prevCompleted) {
        state = "current";
        if (!nextLessonId) nextLessonId = l.id;
        prevCompleted = false;
      } else {
        state = "locked";
      }
      return { id: l.id, title: l.title, kind: l.kind, xpReward: l.xpReward, state };
    }),
  }));

  return { trackTitle: track.title, units, completed, total: lessonIds.length, nextLessonId };
}
