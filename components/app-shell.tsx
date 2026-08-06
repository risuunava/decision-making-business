"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/simulate", label: "Simulasi" },
  { href: "/history", label: "Riwayat" },
  { href: "/data", label: "Data" },
];

export function AppShell({
  children,
  userEmail,
}: Readonly<{
  children: React.ReactNode;
  userEmail?: string;
}>) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={open}
        onToggle={() => setOpen((value) => !value)}
        userEmail={userEmail}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex items-center gap-4 border-b border-line bg-card px-5 py-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Tutup sidebar" : "Buka sidebar"}
            className="hidden text-sub transition-colors duration-150 hover:text-ink md:inline-flex"
          >
            {open ? (
              <PanelLeftClose size={20} strokeWidth={1.5} />
            ) : (
              <PanelLeftOpen size={20} strokeWidth={1.5} />
            )}
          </button>
          <Link href="/dashboard" className="mr-auto md:hidden">
            <Image
              src="/assets/dflogo.png"
              alt="DecideFirst"
              width={20}
              height={20}
              priority
            />
          </Link>
          <div className="flex items-center gap-6 md:hidden">
            {MOBILE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-sub transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
