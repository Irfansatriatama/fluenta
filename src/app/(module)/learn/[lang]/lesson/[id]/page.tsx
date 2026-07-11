import { notFound } from "next/navigation";
import {
  LessonRunner,
  type RunnerQuestion,
} from "@/components/lesson/LessonRunner";
import { DialogRunner, type DialogData } from "@/components/lesson/DialogRunner";
import { SpeakRunner, type SpeakData } from "@/components/lesson/SpeakRunner";
import { FlashcardRunner } from "@/components/lesson/FlashcardRunner";
import { ReadingRunner } from "@/components/lesson/ReadingRunner";
import { LESSON_KIND } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getReadingPassage } from "@/lib/staticContent";

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

  if (!lesson || lesson.unit.track.language.code !== lang) notFound();

  // Dialog / roleplay is script-driven (no questions rows).
  if (lesson.kind === LESSON_KIND.DIALOG) {
    const d = (lesson.metadata ?? {}) as Omit<DialogData, "id" | "xpReward">;
    return (
      <DialogRunner
        lang={lang}
        data={{ id: lesson.id, xpReward: lesson.xpReward, ...d }}
      />
    );
  }

  if (lesson.kind === LESSON_KIND.SCRIPT || lesson.kind === "speaking") {
    const d = (lesson.metadata ?? {}) as Omit<SpeakData, "id" | "xpReward">;
    return <SpeakRunner lang={lang} data={{ id: lesson.id, xpReward: lesson.xpReward, ...d }} />;
  }

  if (lesson.kind === LESSON_KIND.PASSAGE) {
    const meta = (lesson.metadata ?? {}) as { readingId?: string };
    const passage = meta.readingId ? getReadingPassage(lang, meta.readingId) : null;
    if (!passage) notFound();
    return <ReadingRunner passage={passage} lang={lang} backHref={`/learn/${lang}/journey`} lessonId={lesson.id} />;
  }

  if (lesson.kind === LESSON_KIND.FLASHCARD) {
    const meta = (lesson.metadata ?? {}) as { deckId?: string; offset?: number; limit?: number };
    const deck = meta.deckId
      ? await prisma.deck.findUnique({ where: { id: meta.deckId }, include: { cards: { orderBy: { sortOrder: "asc" } } } })
      : null;
    const offset = meta.offset ?? 0;
    const limit = meta.limit ?? 12;
    const cards = (deck?.cards ?? []).slice(offset, offset + limit).map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      reading: c.reading,
      example: c.example,
    }));
    return (
      <FlashcardRunner
        lang={lang}
        title={lesson.title}
        cards={cards}
        backHref={`/learn/${lang}/journey`}
        lessonId={lesson.id}
      />
    );
  }

  if (lesson.questions.length === 0) notFound();

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
      languageName={lesson.unit.track.language.name}
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
