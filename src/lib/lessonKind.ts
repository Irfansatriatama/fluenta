import {
  BookOpen,
  Gamepad2,
  Headphones,
  Layers,
  PencilLine,
  type LucideIcon,
} from "lucide-react";

export const KIND_META: Record<string, { icon: LucideIcon; label: string }> = {
  reading: { icon: BookOpen, label: "Reading" },
  listening: { icon: Headphones, label: "Listening" },
  writing: { icon: PencilLine, label: "Writing" },
  quiz: { icon: Gamepad2, label: "Quiz" },
  flashcard: { icon: Layers, label: "Flashcards" },
};

export function kindMeta(kind: string) {
  return KIND_META[kind] ?? { icon: BookOpen, label: kind };
}
