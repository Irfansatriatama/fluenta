import {
  Award,
  BarChart3,
  Home,
  Layers,
  MessageCircle,
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

// Hub (umbrella) — general, cross-language menu.
export const HUB_NAV: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Reports", href: "/home/reports", icon: BarChart3 },
  { label: "Leaderboard", href: "/home/leaderboard", icon: Trophy },
  { label: "Achievements", href: "/home/achievements", icon: Award },
  { label: "Profile", href: "/home/profile", icon: User },
];

export type ModuleNavItem = {
  label: string;
  segment: string; // appended to /learn/[lang]
  icon: LucideIcon;
};

// Module (per-language) — scoped to /learn/[lang].
export const MODULE_NAV: ModuleNavItem[] = [
  { label: "Home", segment: "", icon: Home },
  { label: "Journey", segment: "/journey", icon: Route },
  { label: "Vocab", segment: "/vocab", icon: Layers },
  { label: "Review", segment: "/review", icon: Repeat2 },
  { label: "Tutor", segment: "/tutor", icon: MessageCircle },
];

export function moduleHref(lang: string, segment: string): string {
  return `/learn/${lang}${segment}`;
}
