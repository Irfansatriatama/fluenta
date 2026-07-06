import {
  BarChart3,
  GraduationCap,
  Home,
  Route,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Primary app navigation — shared by the desktop sidebar and mobile tab bar.
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Journey", href: "/journey", icon: Route },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
];
