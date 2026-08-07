"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";

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
        <main className="w-full flex-1 px-5 pb-24 pt-8 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
