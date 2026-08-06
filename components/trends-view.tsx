"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { SummaryStats, TopItem } from "@/lib/analytics/trends";
import { formatCompactNumber, formatMoney, formatNumber } from "@/lib/constants";

function monthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00`);
  return date
    .toLocaleDateString("id-ID", { month: "short", year: "2-digit" })
    .replace(".", "");
}

function StatCard({
  label,
  value,
  sub,
  subClass,
}: {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line p-4">
      <span className="text-[12px] text-sub">{label}</span>
      <span className="text-[18px] font-semibold text-ink">{value}</span>
      {sub ? (
        <span className={`text-[12px] ${subClass ?? "text-muted"}`}>{sub}</span>
      ) : null}
    </div>
  );
}

export function TrendsView({
  monthly,
  stats,
  top,
  growth,
  currency,
}: {
  monthly: { month: string; revenue: number }[];
  stats: SummaryStats;
  top: TopItem[];
  growth: number | null;
  currency: string;
}) {
  const chartData = monthly.map((entry) => ({
    month: monthLabel(entry.month),
    revenue: entry.revenue,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-ink">Ringkasan Tren</h2>
        <p className="mt-1 text-[13px] text-sub">
          Metrik deskriptif dari data transaksi Anda, tanpa estimasi elastisitas
          harga.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Omzet"
            value={formatMoney(stats.totalRevenue, currency)}
          />
          <StatCard
            label="Rata-rata Omzet Bulanan"
            value={formatMoney(stats.averageMonthlyRevenue, currency)}
          />
          <StatCard
            label="Jumlah Transaksi"
            value={formatNumber(stats.totalTransactions)}
          />
          <StatCard
            label="Nilai Rata-rata Transaksi"
            value={formatMoney(stats.averageTransactionValue, currency)}
          />
          <StatCard
            label="Pertumbuhan Bulan Terakhir"
            value={
              growth === null ? "Belum cukup data" : `${growth > 0 ? "+" : ""}${formatNumber(growth, 1)}%`
            }
            sub={
              growth === null
                ? undefined
                : growth >= 0
                  ? "Dibanding bulan sebelumnya"
                  : "Dibanding bulan sebelumnya"
            }
            subClass={
              growth === null
                ? undefined
                : growth >= 0
                  ? "text-pos"
                  : "text-neg"
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="text-[20px] font-semibold text-ink">Omzet Bulanan</h2>
          <p className="mt-1 text-[13px] text-sub">
            Total nilai transaksi per bulan dari data yang Anda unggah.
          </p>
          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e5e5"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 13, fill: "#737373" }}
                  axisLine={{ stroke: "#e5e5e5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#a3a3a3" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickFormatter={(value: number) => formatCompactNumber(value)}
                />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number"
                      ? formatMoney(value, currency)
                      : String(value ?? "")
                  }
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Omzet"
                  stroke="#171717"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#171717", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card p-6 shadow-card">
          <h2 className="text-[20px] font-semibold text-ink">Item Terlaris</h2>
          <p className="mt-1 text-[13px] text-sub">
            Diurutkan berdasarkan total omzet.
          </p>
          {top.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {top.map((item, index) => (
                <li
                  key={item.item_name}
                  className="flex items-center justify-between gap-2 border-t border-line pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-muted">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-ink">
                        {item.item_name}
                      </span>
                      <span className="text-[12px] text-muted">
                        {formatNumber(item.quantity)} unit terjual
                      </span>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-ink">
                    {formatMoney(item.revenue, currency)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[13px] text-sub">
              Belum ada data untuk ditampilkan.
            </p>
          )}
        </div>
      </div>

      {growth !== null ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-6 shadow-card">
          {growth >= 0 ? (
            <TrendingUp size={20} className="text-pos" />
          ) : (
            <TrendingDown size={20} className="text-neg" />
          )}
          <p className="text-[13px] text-ink">
            Omzet bulan terakhir{" "}
            <span className={`font-semibold ${growth >= 0 ? "text-pos" : "text-neg"}`}>
              {growth > 0 ? "naik" : "turun"} {formatNumber(Math.abs(growth), 1)}%
            </span>{" "}
            dibanding bulan sebelumnya, berdasarkan data transaksi Anda.
          </p>
        </div>
      ) : null}
    </div>
  );
}
