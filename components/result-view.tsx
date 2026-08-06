"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { SimulationResult } from "@/types";
import { buildInsights } from "@/lib/insights/templates";
import type { InsightTone } from "@/lib/insights/templates";
import { formatCompactNumber, formatMoney, formatNumber } from "@/lib/constants";

const TONE_META: Record<
  InsightTone,
  { icon: LucideIcon; className: string }
> = {
  positive: { icon: TrendingUp, className: "text-pos" },
  negative: { icon: TrendingDown, className: "text-neg" },
  warning: { icon: AlertTriangle, className: "text-warn" },
  info: { icon: Info, className: "text-info" },
};

function Metric({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line p-4">
      <span className="text-[12px] text-sub">{label}</span>
      <span className={`text-[16px] font-semibold text-ink ${valueClass ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

export function ResultView({
  result,
  currency,
}: {
  result: SimulationResult;
  currency: string;
}) {
  const profitUp = result.profitChange >= 0;
  const showMargin =
    result.scenarioType === "pricing" || result.scenarioType === "discount";
  const insights = buildInsights(result);

  const chartData = [
    { name: "Sebelum", profit: result.profitBefore },
    { name: "Sesudah", profit: result.profitAfter },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="text-[20px] font-semibold text-ink">
            Hasil Simulasi
          </h2>
          <p className="mt-1 text-[13px] text-sub">
            Perbandingan profit sebelum dan sesudah keputusan.
          </p>

          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e5e5"
                />
                <XAxis
                  dataKey="name"
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
                  cursor={{ fill: "#fafafa" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="profit"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={72}
                >
                  <Cell fill="#d4d4d4" fillOpacity={0.8} />
                  <Cell fill={profitUp ? "#171717" : "#a3a3a3"} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Metric
            label="Profit Sebelum"
            value={formatMoney(result.profitBefore, currency)}
          />
          <Metric
            label="Profit Sesudah"
            value={formatMoney(result.profitAfter, currency)}
          />
          <Metric
            label="Perubahan Profit"
            value={`${profitUp ? "+" : ""}${formatMoney(result.profitChange, currency)} (${profitUp ? "+" : ""}${formatNumber(result.profitChangePercent, 1)}%)`}
            valueClass={profitUp ? "text-pos" : "text-neg"}
          />
          {showMargin ? (
            <Metric
              label="Margin"
              value={`${formatNumber(result.marginBefore, 1)}% menjadi ${formatNumber(result.marginAfter, 1)}%`}
            />
          ) : null}
          {result.breakeven ? (
            <div className="flex flex-col gap-1 rounded-lg border border-line p-4">
              <span className="text-[12px] text-sub">Ambang Impas</span>
              <span className="text-[16px] font-semibold text-ink">
                {formatNumber(result.breakeven.value, 1)}%
              </span>
              <span className="text-[12px] text-muted">
                {result.breakeven.explanation}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 rounded-lg border border-line p-4">
              <span className="text-[12px] text-sub">Ambang Impas</span>
              <span className="text-[16px] font-semibold text-neg">
                Tidak terdefinisi
              </span>
              <span className="text-[12px] text-muted">
                Harga jual tidak menutupi biaya per unit.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-ink">Insight Simulasi Ini</h2>
        <p className="mt-1 text-[13px] text-sub">
          Analisis otomatis dari angka asumsi yang Anda masukkan.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {insights.map((insight, index) => {
            const tone = TONE_META[insight.tone];
            const Icon = tone.icon;
            return (
              <li
                key={index}
                className="flex items-start gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0"
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${tone.className}`} />
                <p className="text-[13px] leading-6 text-ink">{insight.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
