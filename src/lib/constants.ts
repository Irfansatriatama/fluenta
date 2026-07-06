// String constants in place of Prisma enums (project rule: no enum).

export const LESSON_KIND = {
  FLASHCARD: "flashcard",
  READING: "reading",
  LISTENING: "listening",
  WRITING: "writing",
  QUIZ: "quiz",
  DIALOG: "dialog",
  SCRIPT: "script",
} as const;

export const QUESTION_KIND = {
  MCQ: "mcq",
  FILL: "fill",
  MATCH: "match",
  ORDER: "order",
  AUDIO: "audio",
  WRITING: "writing",
} as const;

export const PROGRESS_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

// Shape stored in Question.options / Question.answer (JSON).
export type McqOption = { text: string; sub?: string };
