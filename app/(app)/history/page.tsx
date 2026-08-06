import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/button";
import { SimulationRow } from "@/components/simulation-row";

export const metadata: Metadata = { title: "Decision Log | DecideFirst" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  const { data: simulations } = await supabase
    .from("simulations")
    .select("id, scenario_type, created_at, result")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Decision Log"
        description="Riwayat simulasi yang pernah Anda jalankan."
        action={
          <Link href="/simulate" className={buttonClasses()}>
            Buat Simulasi Baru
          </Link>
        }
      />

      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        {simulations && simulations.length > 0 ? (
          <div>
            {simulations.map((simulation) => (
              <SimulationRow
                key={simulation.id}
                id={simulation.id}
                scenarioType={simulation.scenario_type}
                createdAt={simulation.created_at}
                result={simulation.result}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 p-6">
            <p className="text-[13px] text-sub">
              Belum ada simulasi tersimpan. Jalankan simulasi pertama Anda.
            </p>
            <Link href="/simulate" className={buttonClasses()}>
              Buat Simulasi Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
