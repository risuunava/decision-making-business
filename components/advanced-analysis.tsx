"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, FlaskConical } from "lucide-react";
import { CHART, ChartChrome } from "@/components/chart-chrome";
import type { PricingInput } from "@/types";
import type { ElasticityEstimate } from "@/lib/statistics/elasticity";
import {
  monteCarloProfit,
  percentile,
  MIN_MC_CHANGES,
} from "@/lib/statistics/monteCarlo";
import { formatCompactNumber, formatMoney, formatNumber } from "@/lib/constants";

const MC_ITERATIONS = 1000;
const HISTOGRAM_BINS = 10;

function buildHistogram(
  profits: number[],
  bins: number
): { name: string; count: number }[] {
  if (profits.length === 0) return [];
  const min = profits[0];
  const max = profits[profits.length - 1];
  const span = max - min;
  const bucketCounts = new Array(bins).fill(0);
  for (const profit of profits) {
    const index =
      span === 0
        ? 0
        : Math.min(bins - 1, Math.floor(((profit - min) / span) * bins));
    bucketCounts[index] += 1;
  }
  const label = (value: number) => formatCompactNumber(value);
  return bucketCounts.map((count, index) => ({
    name: `${label(min + (span * index) / bins)}`,
    count,
  }));
}

export function AdvancedAnalysis({
  elasticity,
  volumeChanges,
  currency,
  input,
}: {
  elasticity: ElasticityEstimate | null;
  volumeChanges: number[];
  currency: string;
  input: PricingInput;
}) {
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  const monteCarloReady = volumeChanges.length >= MIN_MC_CHANGES;

  const { histogram, range } = useMemo(() => {
    if (!showMonteCarlo) return { histogram: [], range: null };
    const profits = monteCarloProfit(
      volumeChanges,
      input.currentVolume,
      input.newPrice,
      input.costPerUnit,
      MC_ITERATIONS
    );
    return {
      histogram: buildHistogram(profits, HISTOGRAM_BINS),
      range: {
        low: percentile(profits, 10),
        high: percentile(profits, 90),
      },
    };
  }, [showMonteCarlo, volumeChanges, input]);

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-primary" />
        <h2 className="text-[16px] font-semibold text-ink">
          Analisis dari Data Anda
        </h2>
      </div>

      {elasticity ? (
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-[13px] leading-6 text-ink">
            Estimasi elastisitas harga <span className="font-semibold">{elasticity.itemName}</span>:{" "}
            <span className="font-semibold">{elasticity.elasticity}</span>. Nilai negatif berarti
            kenaikan harga cenderung menurunkan volume. R² sebesar {elasticity.rSquared}{" "}
            dari {elasticity.n} observasi menunjukkan seberapa kuat pola ini terbaca di data Anda.
          </p>
          <p className="text-[12px] text-muted">
            Estimasi awal dari data Anda, makin banyak data makin akurat. Bukan prediksi pasti.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[13px] leading-6 text-sub">
          Belum ada cukup variasi harga di data Anda untuk estimasi elastisitas.
          Dibutuhkan minimal 2 titik harga berbeda dengan data volume penjualan.
        </p>
      )}

      {monteCarloReady ? (
        <div className="mt-4 flex flex-col gap-3">
          {!showMonteCarlo ? (
            <button
              type="button"
              onClick={() => setShowMonteCarlo(true)}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:border-line-hover"
            >
              <FlaskConical size={16} />
              Simulasi Lanjutan (Probabilistik)
            </button>
          ) : (
            <>
              <p className="text-[13px] leading-6 text-ink">
                Distribusi profit dari {formatNumber(MC_ITERATIONS)} iterasi dengan
                sampel perubahan volume bulanan historis Anda. Rentang 10 sampai 90
                persen: {formatMoney(range?.low ?? 0, currency)} sampai{" "}
                {formatMoney(range?.high ?? 0, currency)}.
              </p>
              <ChartChrome height={200} className="mt-4">
                <BarChart
                  data={histogram}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid {...CHART.grid} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#a3a3a3" }}
                    axisLine={CHART.axisLine}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={CHART.yTick}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number" ? `${value} iterasi` : ""
                    }
                    cursor={CHART.cursor}
                    contentStyle={CHART.tooltipStyle}
                  />
                  <Bar
                    dataKey="count"
                    fill="#171717"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ChartChrome>
              {/* ponytail: perubahan volume bisnis keseluruhan dipakai untuk volume produk tunggal.
                  Upgrade ke sampel per item saat riwayat per item cukup panjang. */}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
