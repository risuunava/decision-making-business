"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { MENU } from "@/components/nav-items";
import { signOut } from "@/lib/actions/auth";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card md:hidden">
      <div className="grid h-16 grid-cols-5">
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
              className={`flex flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150 ${
                isActive
                  ? "font-semibold text-ink"
                  : "text-muted hover:text-sub"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
        <form action={signOut} className="flex">
          <button
            type="submit"
            aria-label="Keluar"
            className="flex w-full flex-col items-center justify-center gap-1 text-[11px] text-muted transition-colors duration-150 hover:text-sub"
          >
            <LogOut size={20} strokeWidth={1.5} />
            Keluar
          </button>
        </form>
      </div>
    </nav>
  );
}
