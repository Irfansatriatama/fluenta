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

// Languages on the roadmap — shown as faded "coming soon" stamps on the
// landing passport to signal the platform's breadth. Not enrollable yet.
export const UPCOMING_LANGUAGES: { glyph: string; label: string; rotate: number }[] = [
  { glyph: "Es", label: "Spanish", rotate: -5 },
  { glyph: "Fr", label: "French", rotate: 4 },
  { glyph: "De", label: "German", rotate: -3 },
  { glyph: "ع", label: "Arabic", rotate: 5 },
  { glyph: "हि", label: "Hindi", rotate: -4 },
  { glyph: "ไทย", label: "Thai", rotate: 3 },
];

// Total languages on the roadmap (marketing "+N more").
export const UPCOMING_MORE = 12;
