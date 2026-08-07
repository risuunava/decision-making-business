import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, fetchAllTransactions } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/button";
import { SimulationRow } from "@/components/simulation-row";
import {
  BUSINESS_TYPE_LABEL,
  formatMoney,
  formatNumber,
} from "@/lib/constants";
import {
  monthlyRevenue,
  revenueGrowthPercent,
} from "@/lib/analytics/trends";

export const metadata: Metadata = { title: "Dashboard | DecideFirst" };

export default async function DashboardPage() {
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

  const firstDay = new Date();
  firstDay.setDate(1);
  firstDay.setHours(0, 0, 0, 0);

  const { count: monthlyCount } = await supabase
    .from("simulations")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .gte("created_at", firstDay.toISOString());

  const { data: recent } = await supabase
    .from("simulations")
    .select("id, scenario_type, created_at, result")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const transactions = await fetchAllTransactions(
    business.id,
    "date, quantity, unit_price"
  );

  const transactionRows = (transactions ?? []).map((transaction) => ({
    date: transaction.date as string,
    quantity: Number(transaction.quantity),
    unit_price: Number(transaction.unit_price),
  }));
  const monthly = monthlyRevenue(transactionRows);
  const trendGrowth =
    monthly.length >= 2
      ? revenueGrowthPercent(
          monthly[monthly.length - 1].revenue,
          monthly[monthly.length - 2].revenue
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan aktivitas simulasi bisnis Anda."
      />

      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold text-ink">
              {business.name}
            </h2>
            <p className="mt-1 text-[13px] text-sub">
              {BUSINESS_TYPE_LABEL[business.business_type as keyof typeof BUSINESS_TYPE_LABEL]} | Mata uang{" "}
              {business.currency}
            </p>
          </div>
          <Link href="/simulate" className={buttonClasses()}>
            Buat Simulasi Baru
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-ink">Simulasi Bulan Ini</h2>
        <p className="mt-1 text-[13px] text-sub">
          Jumlah simulasi yang Anda jalankan pada bulan berjalan.
        </p>
        <p className="mt-4 text-[28px] font-semibold text-ink">
          {formatNumber(monthlyCount ?? 0)}
        </p>
      </div>

      {monthly.length > 0 ? (
        <div className="rounded-xl border border-line bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold text-ink">Tren Omzet</h2>
              <p className="mt-1 text-[13px] text-sub">
                Ringkasan dari data transaksi Anda.
              </p>
            </div>
            {trendGrowth !== null ? (
              <span
                className={`text-[13px] font-semibold ${
                  trendGrowth >= 0 ? "text-pos" : "text-neg"
                }`}
              >
                {trendGrowth >= 0 ? "Naik" : "Turun"}{" "}
                {formatNumber(Math.abs(trendGrowth), 1)}% bulan terakhir
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-[24px] font-semibold text-ink">
            {formatMoney(
              monthly[monthly.length - 1].revenue,
              business.currency
            )}
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Omzet pada bulan data terakhir ({monthly[monthly.length - 1].month}).
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-ink">Simulasi Terbaru</h2>
          <Link href="/history" className="text-[13px] font-semibold text-primary hover:text-primary-hover">
            Lihat Semua
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="mt-4">
            {recent.map((simulation) => (
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
          <div className="mt-4 flex flex-col items-start gap-3 rounded-lg border border-dashed border-line p-6">
            <p className="text-[13px] text-sub">
              Belum ada simulasi. Mulai dari yang pertama untuk melihat dampak
              keputusan sebelum dieksekusi.
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
