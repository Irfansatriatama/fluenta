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

export type TrackSummary = {
  code: string;
  level: string;
  framework: string;
  title: string;
  completed: number;
  total: number;
  unlocked: boolean;
};

export type ModuleData = {
  trackCode: string;
  trackTitle: string;
  trackLevel: string;
  trackFramework: string;
  units: UnitNode[];
  completed: number;
  total: number;
  nextLessonId: string | null;
  tracks: TrackSummary[];
};

const EMPTY: ModuleData = {
  trackCode: "", trackTitle: "", trackLevel: "", trackFramework: "",
  units: [], completed: 0, total: 0, nextLessonId: null, tracks: [],
};

// Loads one level track for a language, annotated with the user's progress.
// Lessons unlock sequentially; a track unlocks when the previous one is complete.
// Pass `trackCode` to view a specific (unlocked) level; otherwise the current
// in-progress level is shown.
export async function getModuleData(
  langCode: string,
  userId: string,
  trackCode?: string,
): Promise<ModuleData | null> {
  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) return null;

  const tracks = await prisma.track.findMany({
    where: { languageId: language.id },
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (tracks.length === 0) return EMPTY;

  const allLessonIds = tracks.flatMap((tr) => tr.units.flatMap((u) => u.lessons.map((l) => l.id)));
  const progress = await prisma.lessonProgress.findMany({ where: { userId, lessonId: { in: allLessonIds } } });
  const doneSet = new Set(progress.filter((p) => p.status === PROGRESS_STATUS.COMPLETED).map((p) => p.lessonId));
  const scoreMap = new Map(progress.map((p) => [p.lessonId, p.score ?? null]));

  // Per-track completion + unlock (a track unlocks when the previous is 100% done).
  const summaries: TrackSummary[] = [];
  let prevTrackComplete = true;
  for (const tr of tracks) {
    const ids = tr.units.flatMap((u) => u.lessons.map((l) => l.id));
    const done = ids.filter((id) => doneSet.has(id)).length;
    summaries.push({
      code: tr.code, level: tr.level, framework: tr.framework, title: tr.title,
      completed: done, total: ids.length, unlocked: prevTrackComplete,
    });
    prevTrackComplete = ids.length > 0 && done === ids.length;
  }

  // Pick the track to show: the requested one (if unlocked), else the first
  // unlocked level that isn't finished, else the last unlocked, else the first.
  const unlockedCode = (code: string) => summaries.find((s) => s.code === code)?.unlocked;
  let target = tracks.find((tr) => tr.code === trackCode && unlockedCode(tr.code));
  if (!target) {
    const firstIncomplete = summaries.find((s) => s.unlocked && s.completed < s.total);
    const lastUnlocked = [...summaries].reverse().find((s) => s.unlocked);
    const code = firstIncomplete?.code ?? lastUnlocked?.code ?? tracks[0].code;
    target = tracks.find((tr) => tr.code === code)!;
  }

  let prevCompleted = true;
  let completed = 0;
  let nextLessonId: string | null = null;

  const units: UnitNode[] = target.units.map((u) => ({
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
    trackCode: target.code,
    trackTitle: target.title,
    trackLevel: target.level,
    trackFramework: target.framework,
    units,
    completed,
    total: target.units.flatMap((u) => u.lessons).length,
    nextLessonId,
    tracks: summaries,
  };
}
