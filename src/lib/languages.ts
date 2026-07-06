import { BookOpen, Landmark, Leaf, TreeDeciduous, type LucideIcon } from "lucide-react";

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  label: string;
  accent: string; // hex ink color for the seal
  emblem: LucideIcon;
  rotate: number; // deg — hand-stamped feel
};

// Single source of truth for the 4 launch languages — reused by the
// passport seals, the language picker, and (later) enrollment.
export const LANGUAGES: Language[] = [
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    label: "JAPANESE",
    accent: "#b23a2e",
    emblem: TreeDeciduous,
    rotate: -4,
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    label: "KOREAN",
    accent: "#3b5c99",
    emblem: Landmark,
    rotate: 3,
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    label: "CHINESE",
    accent: "#2f7d53",
    emblem: Leaf,
    rotate: -3,
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    label: "ENGLISH",
    accent: "#5b4b9e",
    emblem: BookOpen,
    rotate: 4,
  },
];
