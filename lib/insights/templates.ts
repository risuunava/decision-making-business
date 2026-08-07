import type { SimulationResult } from "@/types";
import { formatNumber, SCENARIO_VERB } from "@/lib/constants";

export type InsightTone = "positive" | "negative" | "warning" | "info";

export interface Insight {
  tone: InsightTone;
  text: string;
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

function verdictInsight(result: SimulationResult): Insight {
  const label = SCENARIO_VERB[result.scenarioType];
  if (result.profitChangePercent > 0) {
    return {
      tone: "positive",
      text: `${label} ini menaikkan profit ${formatPercent(
        result.profitChangePercent
      )} dibandingkan kondisi sekarang.`,
    };
  }
  if (result.profitChangePercent < 0) {
    return {
      tone: "negative",
      text: `${label} ini menurunkan profit ${formatPercent(
        result.profitChangePercent
      )} dibandingkan kondisi sekarang.`,
    };
  }
  return {
    tone: "info",
    text: `${label} ini tidak mengubah profit secara signifikan.`,
  };
}

function breakevenInsight(result: SimulationResult): Insight {
  const breakeven = result.breakeven;
  const label = SCENARIO_VERB[result.scenarioType];

  if (!breakeven) {
    return {
      tone: "negative",
      text: "Harga jual berada di bawah atau sama dengan biaya per unit. Setiap unit yang terjual menambah kerugian, simulasi ini tidak layak dijalankan.",
    };
  }

  if (breakeven.metric === "maxVolumeDrop") {
    if (result.profitChangePercent > 0) {
      return {
        tone: "positive",
        text: `${label} ini tetap menguntungkan selama pelanggan tidak turun lebih dari ${formatPercent(
          breakeven.value
        )}.`,
      };
    }
    if (result.scenarioType === "inventory") {
      return {
        tone: "warning",
        text: "Setiap penurunan volume penjualan memotong profit secara proporsional. Pastikan asumsi dampak perubahan stok terhadap penjualan realistis.",
      };
    }
    return {
      tone: "warning",
      text: `Dengan asumsi yang dipilih, profit turun. Ambang penurunan volume agar profit tetap sama adalah ${formatPercent(
        breakeven.value
      )}.`,
    };
  }

  if (breakeven.metric === "minVolumeIncrease") {
    if (result.profitChangePercent >= 0) {
      return {
        tone: "positive",
        text: `${label} ini tetap aman karena kenaikan volume yang dibutuhkan untuk impas hanya ${formatPercent(
          breakeven.value
        )}.`,
      };
    }
    return {
      tone: "warning",
      text: `Diperlukan kenaikan volume minimal ${formatPercent(
        breakeven.value
      )} agar profit setelah ${label} tidak turun.`,
    };
  }

  if (breakeven.metric === "minRevenueIncrease") {
    if (result.profitChangePercent >= 0) {
      return {
        tone: "positive",
        text: `Biaya tambahan sudah tertutup. Kenaikan omzet yang dibutuhkan untuk impas hanya ${formatPercent(
          breakeven.value
        )}.`,
      };
    }
    return {
      tone: "warning",
      text: `Biaya tambahan pegawai belum tertutup. Omzet perlu naik minimal ${formatPercent(
        breakeven.value
      )} agar impas.`,
    };
  }

  return { tone: "info", text: breakeven.explanation };
}

function marginInsight(result: SimulationResult): Insight | null {
  if (result.scenarioType === "staffing" || result.scenarioType === "inventory") {
    return null;
  }
  if (result.marginAfter < result.marginBefore) {
    return {
      tone: "warning",
      text: `Margin turun dari ${formatPercent(
        result.marginBefore
      )} menjadi ${formatPercent(result.marginAfter)}. Profit tetap bertahan hanya karena volume penjualan yang lebih tinggi.`,
    };
  }
  if (result.marginAfter > result.marginBefore) {
    return {
      tone: "positive",
      text: `Margin naik dari ${formatPercent(
        result.marginBefore
      )} menjadi ${formatPercent(result.marginAfter)}.`,
    };
  }
  return null;
}

export function buildInsights(result: SimulationResult): Insight[] {
  const insights: Insight[] = [];
  insights.push(verdictInsight(result));
  insights.push(breakevenInsight(result));
  const margin = marginInsight(result);
  if (margin) insights.push(margin);
  insights.push({
    tone: "info",
    text: "Angka ini dihitung dari asumsi yang Anda masukkan, bukan prediksi dari data historis.",
  });
  return insights;
}