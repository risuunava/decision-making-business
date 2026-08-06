import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/simulate", label: "Simulasi" },
  { href: "/history", label: "Riwayat" },
  { href: "/data", label: "Data" },
];

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email ?? undefined} />
      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex items-center gap-6 border-b border-line bg-card px-6 py-3 md:hidden">
          <Link href="/dashboard" className="mr-auto">
            <Image
              src="/assets/dflogo.png"
              alt="DecideFirst"
              width={20}
              height={20}
              priority
            />
          </Link>
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-sub transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
