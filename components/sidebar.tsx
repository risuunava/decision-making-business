"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  History,
  Database,
  BarChart3,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MENU: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/simulate", label: "Scenario Builder", icon: FlaskConical },
  { href: "/history", label: "Decision Log", icon: History },
];

const MENU_DISABLED: { label: string; icon: LucideIcon; note: string }[] = [
  { label: "Data Bisnis", icon: Database, note: "Phase 2" },
  { label: "Insight & Benchmark", icon: BarChart3, note: "Phase 2+" },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col bg-sidebar md:flex">
      <div className="px-4 py-6">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-sidebar-fg-active">
          DecideFirst
        </p>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {MENU.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-sidebar-active font-semibold text-sidebar-fg-active"
                  : "text-sidebar-fg hover:text-sidebar-fg-active"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-2 border-t border-white/10 pt-2">
          {MENU_DISABLED.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-fg opacity-50"
                title={`${item.label} tersedia di ${item.note}`}
              >
                <Icon size={18} strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
                <span className="text-[11px]">{item.note}</span>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/10 px-4 py-4">
        {userEmail ? (
          <p className="mb-3 truncate text-[12px] text-sidebar-fg">{userEmail}</p>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-fg transition-colors duration-150 hover:text-sidebar-fg-active"
          >
            <LogOut size={18} strokeWidth={2} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
