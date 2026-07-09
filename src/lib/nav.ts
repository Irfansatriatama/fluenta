import {
  Award,
  BarChart3,
  BookText,
  Gamepad2,
  Home,
  Languages,
  Layers,
  MessageCircle,
  MessagesSquare,
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
// Full module menu (desktop sidebar).
export const MODULE_NAV: ModuleNavItem[] = [
  { label: "Home", segment: "", icon: Home },
  { label: "Journey", segment: "/journey", icon: Route },
  { label: "Vocab", segment: "/vocab", icon: Layers },
  { label: "Characters", segment: "/characters", icon: Languages },
  { label: "Grammar", segment: "/grammar", icon: BookText },
  { label: "Dialogs", segment: "/dialogs", icon: MessagesSquare },
  { label: "Games", segment: "/games", icon: Gamepad2 },
  { label: "Review", segment: "/review", icon: Repeat2 },
  { label: "Tutor", segment: "/tutor", icon: MessageCircle },
];

// Condensed set for the mobile bottom tab bar (max 5).
export const MODULE_TABS: ModuleNavItem[] = [
  { label: "Home", segment: "", icon: Home },
  { label: "Journey", segment: "/journey", icon: Route },
  { label: "Vocab", segment: "/vocab", icon: Layers },
  { label: "Review", segment: "/review", icon: Repeat2 },
  { label: "Tutor", segment: "/tutor", icon: MessageCircle },
];

export function moduleHref(lang: string, segment: string): string {
  return `/learn/${lang}${segment}`;
}
