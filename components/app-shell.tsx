"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";

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
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
