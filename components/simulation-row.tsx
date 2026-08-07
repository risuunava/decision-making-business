import Link from "next/link";
import type { SimulationResult } from "@/types";
import { SCENARIO_LABEL, formatDate, formatNumber } from "@/lib/constants";

export function statusText(result: SimulationResult): {
  text: string;
  className: string;
} {
  if (result.profitChangePercent > 0) {
    return {
      text: `Profit Naik +${formatNumber(result.profitChangePercent, 1)}%`,
      className: "text-pos",
    };
  }
  if (result.profitChangePercent < 0) {
    return {
      text: `Profit Turun ${formatNumber(result.profitChangePercent, 1)}%`,
      className: "text-neg",
    };
  }
  return { text: "Profit Tetap", className: "text-info" };
}

export function SimulationRow({
  id,
  scenarioType,
  createdAt,
  result,
}: {
  id: string;
  scenarioType: SimulationResult["scenarioType"];
  createdAt: string;
  result: SimulationResult;
}) {
  const status = statusText(result);

  return (
    <Link
      href={`/history/${id}`}
      className="grid grid-cols-2 items-center gap-2 border-b border-line py-3 transition-colors duration-150 last:border-b-0 hover:bg-neutral-50 sm:grid-cols-[1fr_1.4fr_auto] sm:gap-6"
    >
      <span className="text-[12px] font-semibold uppercase text-muted">
        SIM#{id.slice(0, 8).toUpperCase()}
      </span>
      <span className="text-sm text-ink sm:order-none">{SCENARIO_LABEL[scenarioType]}</span>
      <span className="text-[13px] text-sub">{formatDate(createdAt)}</span>
      <span className={`col-span-2 text-right text-[13px] font-semibold sm:col-span-1 ${status.className}`}>
        {status.text}
      </span>
    </Link>
  );
}
