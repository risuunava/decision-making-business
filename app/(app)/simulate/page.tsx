import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, fetchAllTransactions } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/button";
import { ScenarioForm } from "@/components/scenario-form";
import { BenchmarkCard } from "@/components/benchmark-card";
import { DataContextCard } from "@/components/data-context-card";
import {
  monthlyVolume,
  summaryStats,
} from "@/lib/analytics/trends";
import {
  estimateElasticity,
  priceVolumePairs,
  type ElasticityEstimate,
} from "@/lib/statistics/elasticity";
import { volumeChangeSeries } from "@/lib/statistics/monteCarlo";

export const metadata: Metadata = { title: "Simulasi Baru | DecideFirst" };

function computeAnalysis(
  rows: { date: string; item_name: string; quantity: number; unit_price: number }[]
): { elasticity: ElasticityEstimate | null; volumeChanges: number[] } {
  let elasticity: ElasticityEstimate | null = null;
  const pairs = priceVolumePairs(rows);
  let topItem: string | null = null;
  let topQuantity = 0;
  for (const [itemName, itemPairs] of pairs) {
    const total = itemPairs.reduce((sum, pair) => sum + pair.quantity, 0);
    if (total > topQuantity) {
      topQuantity = total;
      topItem = itemName;
    }
  }
  if (topItem) {
    elasticity = estimateElasticity(topItem, pairs.get(topItem)!);
  }
  return {
    elasticity,
    volumeChanges: volumeChangeSeries(monthlyVolume(rows)),
  };
}

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

  const transactions = await fetchAllTransactions(
    business.id,
    "date, item_name, quantity, unit_price"
  );

  const rows = (transactions ?? []).map((transaction) => ({
    date: transaction.date as string,
    item_name: transaction.item_name as string,
    quantity: Number(transaction.quantity),
    unit_price: Number(transaction.unit_price),
  }));

  const stats = summaryStats(rows);
  const volumes = monthlyVolume(rows);
  const averageMonthlyVolume =
    volumes.length > 0 ? stats.totalQuantity / volumes.length : null;
  const lastMonthKey = volumes.length > 0 ? volumes[volumes.length - 1].month : null;
  const lastMonth = lastMonthKey
    ? new Date(`${lastMonthKey}-01T00:00:00`).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : null;

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
      <ScenarioForm
        currency={business.currency}
        businessType={business.business_type}
        analysis={computeAnalysis(rows)}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <DataContextCard
          monthlyRevenue={stats.averageMonthlyRevenue > 0 ? stats.averageMonthlyRevenue : null}
          averageMonthlyVolume={averageMonthlyVolume}
          lastMonth={lastMonth}
          currency={business.currency}
        />
        <BenchmarkCard businessType={business.business_type} />
      </div>
    </div>
  );
}
