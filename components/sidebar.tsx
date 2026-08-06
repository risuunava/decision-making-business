"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  History,
  Database,
  LogOut,
  PanelLeft,
  PanelRight,
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
  { href: "/data", label: "Data Bisnis", icon: Database },
];

export function Sidebar({
  open,
  onToggle,
  userEmail,
}: {
  open: boolean;
  onToggle: () => void;
  userEmail?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-line bg-sidebar transition-[width] duration-200 md:flex ${
        open ? "w-[240px]" : "w-[64px]"
      }`}
    >
      <div
        className={`flex h-full flex-col ${open ? "w-[240px]" : "w-[64px]"}`}
      >
        <div
          className={`relative flex items-center py-6 ${
            open ? "px-4" : "justify-center"
          }`}
        >
          <Image
            src={open ? "/assets/logoname.png" : "/assets/dflogo.png"}
            alt="DecideFirst"
            width={open ? 142 : 26}
            height={26}
            priority
          />
          {open ? (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Ciutkan sidebar"
              className="ml-auto text-sub transition-colors duration-150 hover:text-ink"
            >
              <PanelLeft size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Buka sidebar"
              className="absolute right-2 top-6 text-sub transition-colors duration-150 hover:text-ink"
            >
              <PanelRight size={18} strokeWidth={1.5} />
            </button>
          )}
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
                title={open ? undefined : item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-sidebar-active font-semibold text-white"
                    : "text-sidebar-fg hover:bg-neutral-100 hover:text-sidebar-fg-active"
                } ${open ? "" : "justify-center px-0"}`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {open ? item.label : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-line px-4 py-4">
          {open && userEmail ? (
            <p className="mb-3 truncate text-[12px] text-muted">{userEmail}</p>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              title={open ? undefined : "Keluar"}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-fg transition-colors duration-150 hover:bg-neutral-100 hover:text-sidebar-fg-active ${
                open ? "" : "justify-center px-0"
              }`}
            >
              <LogOut size={18} strokeWidth={1.5} />
              {open ? "Keluar" : null}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
