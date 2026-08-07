import type { ScenarioType, SimulationResult } from "@/types";
import { formatNumber, SCENARIO_VERB } from "@/lib/constants";

export type InsightTone = "positive" | "negative" | "warning" | "info";

export interface Insight {
  tone: InsightTone;
  text: string;
}

function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

const SCENARIO_ORDER: ScenarioType[] = [
  "pricing",
  "discount",
  "staffing",
  "inventory",
];

// Variasi dipilih deterministik dari urutan skenario, bukan acak,
// supaya output tetap bisa diuji dan tidak terasa berulang antar skenario.
function variantIndex(result: SimulationResult, count: number): number {
  return SCENARIO_ORDER.indexOf(result.scenarioType) % count;
}

function verdictInsight(result: SimulationResult): Insight {
  const label = SCENARIO_VERB[result.scenarioType];
  const percent = formatPercent(result.profitChangePercent);
  const positiveTexts = [
    `${label} ini menaikkan profit ${percent} dibandingkan kondisi sekarang.`,
    `Dengan ${label}, profit naik ${percent} dari kondisi saat ini.`,
  ];
  const negativeTexts = [
    `${label} ini menurunkan profit ${percent} dibandingkan kondisi sekarang.`,
    `Dengan ${label}, profit turun ${percent} dari kondisi saat ini.`,
  ];
  const neutralTexts = [
    `${label} ini tidak mengubah profit secara signifikan.`,
    `Tidak ada perubahan profit berarti dari ${label} ini.`,
  ];
  if (result.profitChangePercent > 0) {
    return {
      tone: "positive",
      text: positiveTexts[variantIndex(result, positiveTexts.length)],
    };
  }
  if (result.profitChangePercent < 0) {
    return {
      tone: "negative",
      text: negativeTexts[variantIndex(result, negativeTexts.length)],
    };
  }
  return {
    tone: "info",
    text: neutralTexts[variantIndex(result, neutralTexts.length)],
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
      const positiveTexts = [
        `${label} ini tetap menguntungkan selama pelanggan tidak turun lebih dari ${formatPercent(
          breakeven.value
        )}.`,
        `Simulasi ini masih untung selama penurunan volume tidak melebihi ${formatPercent(
          breakeven.value
        )}.`,
      ];
      return {
        tone: "positive",
        text: positiveTexts[variantIndex(result, positiveTexts.length)],
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
  const disclaimerTexts = [
    "Angka ini dihitung dari asumsi yang Anda masukkan, bukan prediksi dari data historis.",
    "Hasil ini mengikuti asumsi yang Anda isi, bukan perkiraan dari data historis.",
  ];
  insights.push({
    tone: "info",
    text: disclaimerTexts[variantIndex(result, disclaimerTexts.length)],
  });
  return insights;
}