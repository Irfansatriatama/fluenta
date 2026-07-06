import { notFound } from "next/navigation";
import {
  LessonRunner,
  type RunnerQuestion,
} from "@/components/lesson/LessonRunner";
import { prisma } from "@/lib/prisma";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      unit: { include: { track: { include: { language: true } } } },
    },
  });

  if (!lesson || lesson.unit.track.language.code !== lang || lesson.questions.length === 0) {
    notFound();
  }

  const meta = (lesson.metadata ?? {}) as {
    passage?: string;
    highlight?: string;
    transcript?: string;
    example?: string;
  };

  const questions: RunnerQuestion[] = lesson.questions.map((q) => ({
    id: q.id,
    kind: q.kind,
    prompt: q.prompt,
    promptNative: q.promptNative,
    options: (q.options ?? null) as RunnerQuestion["options"],
    answer: (q.answer ?? null) as RunnerQuestion["answer"],
    explanation: q.explanation,
  }));

  return (
    <LessonRunner
      lang={lang}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        kind: lesson.kind,
        xpReward: lesson.xpReward,
        passage: meta.passage ?? null,
        highlight: meta.highlight ?? null,
        transcript: meta.transcript ?? null,
        example: meta.example ?? null,
      }}
      questions={questions}
    />
  );
}
