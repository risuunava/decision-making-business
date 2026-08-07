import {
  LayoutDashboard,
  FlaskConical,
  History,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobileLabel?: string;
}

export const MENU: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/simulate",
    label: "Scenario Builder",
    icon: FlaskConical,
    mobileLabel: "Scenario",
  },
  { href: "/history", label: "Decision Log", icon: History },
  { href: "/data", label: "Data Bisnis", icon: Database },
];
