import {
  Award,
  BarChart3,
  BookOpen,
  BookText,
  Gamepad2,
  GraduationCap,
  Home,
  Languages,
  Layers,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Repeat2,
  Route,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Hub (umbrella) — general, cross-language menu. Labels match the hub's own
// room names (Paspor/Papan/Progres) for one coherent vocabulary.
export const HUB_NAV: NavItem[] = [
  { label: "Beranda", href: "/home", icon: Home },
  { label: "Progres", href: "/home/reports", icon: BarChart3 },
  { label: "Papan", href: "/home/leaderboard", icon: Trophy },
  { label: "Paspor", href: "/home/achievements", icon: Award },
  { label: "Profil", href: "/home/profile", icon: User },
];

export type ModuleNavItem = {
  label: string;
  segment: string; // appended to /learn/[lang]
  icon: LucideIcon;
};

// Module (per-language) — scoped to /learn/[lang].
// Full module menu (desktop sidebar).
export const MODULE_NAV: ModuleNavItem[] = [
  { label: "Beranda", segment: "", icon: Home },
  { label: "Peta", segment: "/journey", icon: Route },
  { label: "Ujian", segment: "/exam", icon: GraduationCap },
  { label: "Kosakata", segment: "/vocab", icon: Layers },
  { label: "Aksara", segment: "/characters", icon: Languages },
  { label: "Bacaan", segment: "/reading", icon: BookOpen },
  { label: "Berita", segment: "/news", icon: Newspaper },
  { label: "Tata Bahasa", segment: "/grammar", icon: BookText },
  { label: "Dialog", segment: "/dialogs", icon: MessagesSquare },
  { label: "Permainan", segment: "/games", icon: Gamepad2 },
  { label: "Ulasan", segment: "/review", icon: Repeat2 },
  { label: "Tutor", segment: "/tutor", icon: MessageCircle },
];

// Condensed set for the mobile bottom tab bar (max 5).
export const MODULE_TABS: ModuleNavItem[] = [
  { label: "Beranda", segment: "", icon: Home },
  { label: "Peta", segment: "/journey", icon: Route },
  { label: "Kosakata", segment: "/vocab", icon: Layers },
  { label: "Ulasan", segment: "/review", icon: Repeat2 },
  { label: "Tutor", segment: "/tutor", icon: MessageCircle },
];

export function moduleHref(lang: string, segment: string): string {
  return `/learn/${lang}${segment}`;
}
