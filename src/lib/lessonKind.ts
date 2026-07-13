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
  reading: { icon: ReadingGlyph, label: "Bacaan" },
  listening: { icon: ListeningGlyph, label: "Menyimak" },
  writing: { icon: WritingGlyph, label: "Menulis" },
  quiz: { icon: QuizGlyph, label: "Kuis" },
  flashcard: { icon: FlashcardGlyph, label: "Flashcard" },
  dialog: { icon: DialogGlyph, label: "Dialog" },
  speaking: { icon: SpeakingGlyph, label: "Berbicara" },
  passage: { icon: ReadingGlyph, label: "Bacaan" },
  conversation: { icon: DialogGlyph, label: "Percakapan" },
};

export function kindMeta(kind: string) {
  return KIND_META[kind] ?? { icon: ReadingGlyph, label: kind };
}
