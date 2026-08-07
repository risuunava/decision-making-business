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
}

export const MENU: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/simulate", label: "Scenario Builder", icon: FlaskConical },
  { href: "/history", label: "Decision Log", icon: History },
  { href: "/data", label: "Data Bisnis", icon: Database },
];
