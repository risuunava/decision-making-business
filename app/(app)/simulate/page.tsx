import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/button";
import { ScenarioForm } from "@/components/scenario-form";

export const metadata: Metadata = { title: "Simulasi Baru | DecideFirst" };

export default async function SimulatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Simulasi Baru"
        description="Buat skenario keputusan dan lihat dampaknya sebelum dieksekusi."
        action={
          <Link href="/history" className={buttonClasses("secondary")}>
            Riwayat
          </Link>
        }
      />
      <ScenarioForm currency={business.currency} />
    </div>
  );
}
