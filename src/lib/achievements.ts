import {
  Award,
  Flame,
  Footprints,
  GraduationCap,
  Globe,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type AchievementStat = {
  lessonsCompleted: number;
  languages: number;
  streak: number;
  longest: number;
  totalXp: number;
};

export type Achievement = {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  earned: boolean;
};

// Achievements are derived live from the user's real progress — no separate
// award pipeline needed for the MVP.
export function computeAchievements(s: AchievementStat): Achievement[] {
  return [
    { code: "first-steps", title: "First Steps", description: "Complete your first lesson", icon: Footprints, color: "#b23a2e", earned: s.lessonsCompleted >= 1 },
    { code: "getting-started", title: "Getting Started", description: "Activate a language", icon: Sparkles, color: "#c1912e", earned: s.languages >= 1 },
    { code: "on-fire", title: "On Fire", description: "Reach a 3-day streak", icon: Flame, color: "#e8862f", earned: s.streak >= 3 },
    { code: "dedicated", title: "Dedicated", description: "Reach a 7-day streak", icon: Flame, color: "#e8862f", earned: s.longest >= 7 },
    { code: "scholar", title: "Scholar", description: "Earn 100 XP", icon: Star, color: "#c1912e", earned: s.totalXp >= 100 },
    { code: "xp-hunter", title: "XP Hunter", description: "Earn 500 XP", icon: Zap, color: "#c1912e", earned: s.totalXp >= 500 },
    { code: "lesson-master", title: "Lesson Master", description: "Complete 10 lessons", icon: GraduationCap, color: "#2f7d53", earned: s.lessonsCompleted >= 10 },
    { code: "polyglot", title: "Polyglot", description: "Learn 3 languages", icon: Globe, color: "#5b4b9e", earned: s.languages >= 3 },
    { code: "global-explorer", title: "Global Explorer", description: "Learn all 4 launch languages", icon: Trophy, color: "#23201b", earned: s.languages >= 4 },
    { code: "collector", title: "Collector", description: "Earn 6 achievements", icon: Award, color: "#c1912e", earned: false },
  ];
}
