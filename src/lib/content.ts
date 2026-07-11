import { prisma } from "@/lib/prisma";
import { PROGRESS_STATUS } from "@/lib/constants";

export type LessonState = "completed" | "current" | "locked";

export type LessonNode = {
  id: string;
  title: string;
  kind: string;
  xpReward: number;
  state: LessonState;
  score: number | null; // 0–100 for completed lessons (drives star rating)
};

export type UnitNode = {
  id: string;
  title: string;
  lessons: LessonNode[];
};

export type ModuleData = {
  trackTitle: string;
  trackLevel: string;
  trackFramework: string;
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
  if (!track) return { trackTitle: "", trackLevel: "", trackFramework: "", units: [], completed: 0, total: 0, nextLessonId: null };

  const lessonIds = track.units.flatMap((u) => u.lessons.map((l) => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds } },
  });
  const doneSet = new Set(
    progress.filter((p) => p.status === PROGRESS_STATUS.COMPLETED).map((p) => p.lessonId),
  );
  const scoreMap = new Map(progress.map((p) => [p.lessonId, p.score ?? null]));

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
      return {
        id: l.id, title: l.title, kind: l.kind, xpReward: l.xpReward, state,
        score: state === "completed" ? (scoreMap.get(l.id) ?? 100) : null,
      };
    }),
  }));

  return {
    trackTitle: track.title,
    trackLevel: track.level,
    trackFramework: track.framework,
    units,
    completed,
    total: lessonIds.length,
    nextLessonId,
  };
}
