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
    { code: "first-steps", title: "Langkah Pertama", description: "Selesaikan pelajaran pertamamu", icon: Footprints, color: "#b23a2e", earned: s.lessonsCompleted >= 1 },
    { code: "getting-started", title: "Mulai Melangkah", description: "Aktifkan sebuah bahasa", icon: Sparkles, color: "#c1912e", earned: s.languages >= 1 },
    { code: "on-fire", title: "Membara", description: "Capai runtun 3 hari", icon: Flame, color: "#e8862f", earned: s.streak >= 3 },
    { code: "dedicated", title: "Tekun", description: "Capai runtun 7 hari", icon: Flame, color: "#e8862f", earned: s.longest >= 7 },
    { code: "scholar", title: "Pelajar", description: "Kumpulkan 100 XP", icon: Star, color: "#c1912e", earned: s.totalXp >= 100 },
    { code: "xp-hunter", title: "Pemburu XP", description: "Kumpulkan 500 XP", icon: Zap, color: "#c1912e", earned: s.totalXp >= 500 },
    { code: "lesson-master", title: "Ahli Pelajaran", description: "Selesaikan 10 pelajaran", icon: GraduationCap, color: "#2f7d53", earned: s.lessonsCompleted >= 10 },
    { code: "polyglot", title: "Poliglot", description: "Pelajari 3 bahasa", icon: Globe, color: "#5b4b9e", earned: s.languages >= 3 },
    { code: "global-explorer", title: "Penjelajah Dunia", description: "Pelajari semua 4 bahasa awal", icon: Trophy, color: "#23201b", earned: s.languages >= 4 },
    { code: "collector", title: "Kolektor", description: "Raih 6 pencapaian", icon: Award, color: "#c1912e", earned: false },
  ];
}
