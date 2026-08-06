import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, fetchAllTransactions } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { DataUpload } from "@/components/data-upload";
import { TrendsView } from "@/components/trends-view";
import {
  monthlyRevenue,
  revenueGrowthPercent,
  summaryStats,
  topItems,
} from "@/lib/analytics/trends";

export const metadata: Metadata = { title: "Data Bisnis | DecideFirst" };

export default async function DataPage() {
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

  const transactions = await fetchAllTransactions(
    business.id,
    "id, date, item_name, quantity, unit_price, cost_per_unit"
  );

  const rows = (transactions ?? []).map((transaction) => ({
    date: transaction.date as string,
    item_name: transaction.item_name as string,
    quantity: Number(transaction.quantity),
    unit_price: Number(transaction.unit_price),
  }));

  const monthly = monthlyRevenue(rows);
  const stats = summaryStats(rows);
  const top = topItems(rows, 5);
  const growth =
    monthly.length >= 2
      ? revenueGrowthPercent(
          monthly[monthly.length - 1].revenue,
          monthly[monthly.length - 2].revenue
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Bisnis"
        description="Unggah transaksi untuk melihat tren omzet. Data tidak dipakai untuk prediksi otomatis."
      />

      <DataUpload />

      {rows.length > 0 ? (
        <TrendsView
          monthly={monthly}
          stats={stats}
          top={top}
          growth={growth}
          currency={business.currency}
        />
      ) : (
        <div className="rounded-xl border border-line bg-card p-6 shadow-card">
          <h2 className="text-[20px] font-semibold text-ink">Ringkasan Tren</h2>
          <p className="mt-1 text-[13px] text-sub">
            Setelah data transaksi tersimpan, ringkasan omzet bulanan, pertumbuhan,
            dan item terlaris akan muncul di sini.
          </p>
        </div>
      )}
    </div>
  );
}
