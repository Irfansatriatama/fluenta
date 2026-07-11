import { type ComponentType } from "react";
import {
  DialogGlyph,
  FlashcardGlyph,
  ListeningGlyph,
  QuizGlyph,
  ReadingGlyph,
  SpeakingGlyph,
  WritingGlyph,
} from "@/components/lesson/LessonGlyph";

type Glyph = ComponentType<{ className?: string; strokeWidth?: number }>;

export const KIND_META: Record<string, { icon: Glyph; label: string }> = {
  reading: { icon: ReadingGlyph, label: "Reading" },
  listening: { icon: ListeningGlyph, label: "Listening" },
  writing: { icon: WritingGlyph, label: "Writing" },
  quiz: { icon: QuizGlyph, label: "Quiz" },
  flashcard: { icon: FlashcardGlyph, label: "Flashcards" },
  dialog: { icon: DialogGlyph, label: "Dialog" },
  speaking: { icon: SpeakingGlyph, label: "Speaking" },
  passage: { icon: ReadingGlyph, label: "Reading" },
};

export function kindMeta(kind: string) {
  return KIND_META[kind] ?? { icon: ReadingGlyph, label: kind };
}
