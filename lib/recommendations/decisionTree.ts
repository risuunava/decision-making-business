import { BENCHMARKS } from "@/lib/data/benchmarks";
import type { InsightTone } from "@/lib/insights/templates";
import type { BusinessType, ScenarioInput, SimulationResult } from "@/types";

export interface Recommendation {
  tone: InsightTone;
  text: string;
  reason: string;
}

const HIGH_STAFFING_BREAKEVEN_PERCENT = 30;

// Decision tree kurasi manual. Setiap rule punya alasan bisnis di field `reason`,
// ditampilkan ke user supaya rekomendasi bisa diaudit, bukan black box.
export function buildRecommendations(
  result: SimulationResult,
  businessType: BusinessType,
  input: ScenarioInput
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const benchmark = BENCHMARKS[businessType];

  // Margin kotor di bawah rentang tipikal industri: perbaiki biaya dulu
  // sebelum mainkan harga, karena margin tipis mudah tergerus.
  if (
    (result.scenarioType === "pricing" || result.scenarioType === "discount") &&
    result.marginBefore < benchmark.grossMarginRange.min
  ) {
    recommendations.push({
      tone: "warning",
      text: `Margin kotor Anda ${result.marginBefore.toFixed(0)}% berada di bawah rentang tipikal ${businessType} (${benchmark.grossMarginRange.min} sampai ${benchmark.grossMarginRange.max}%). Pertimbangkan efisiensi biaya sebelum mengubah harga.`,
      reason:
        "Margin tipis membuat bisnis lebih rentan. Kenaikan harga saat margin tipis berisiko menggeser pelanggan tanpa ruang untuk bertahan.",
    });
  }

  // Kenaikan harga yang profitnya justru turun: asumsi belum aman.
  if (result.scenarioType === "pricing" && result.profitChange < 0) {
    recommendations.push({
      tone: "warning",
      text: "Dengan asumsi ini, kenaikan harga menurunkan profit. Tinjau ulang asumsi penurunan volume atau tunda kenaikan harga.",
      reason:
        "Kenaikan harga layak dieksekusi bila tetap untung pada asumsi volume yang pesimistis. Di sini profit turun, artinya risiko lebih besar dari manfaat.",
    });
  }

  // Asumsi penurunan volume kecil untuk kenaikan harga: bandingkan dengan
  // pola umum industri sebelum yakin.
  if (
    result.scenarioType === "pricing" &&
    input.scenarioType === "pricing" &&
    input.volumeChangePercent >= -5 &&
    result.profitChange > 0
  ) {
    recommendations.push({
      tone: "info",
      text: `Asumsi penurunan volume hanya ${Math.abs(
        input.volumeChangePercent
      )}% untuk kenaikan harga tergolong optimistis.`,
      reason: benchmark.priceElasticityNote,
    });
  }

  // Diskon di bawah biaya: setiap unit terjual menambah rugi.
  if (
    result.scenarioType === "discount" &&
    input.scenarioType === "discount" &&
    input.currentPrice * (1 - input.discountPercent / 100) <= input.costPerUnit
  ) {
    recommendations.push({
      tone: "negative",
      text: "Harga setelah diskon tidak menutupi biaya per unit. Setiap unit terjual menambah kerugian, diskon ini tidak layak.",
      reason:
        "Unit yang dijual di bawah biaya membutuhkan kenaikan volume yang tidak realistis untuk balik modal.",
    });
  }

  // Target omzet impas terlalu tinggi untuk pegawai baru.
  if (
    result.scenarioType === "staffing" &&
    result.breakeven?.metric === "minRevenueIncrease" &&
    result.breakeven.value > HIGH_STAFFING_BREAKEVEN_PERCENT
  ) {
    recommendations.push({
      tone: "warning",
      text: `Untuk menutup biaya pegawai baru, omzet harus naik ${result.breakeven.value.toFixed(0)}%. Target ini cukup tinggi.`,
      reason:
        "Kenaikan omzet di atas 30% jarang tercapai dalam waktu singkat untuk UMKM. Pertimbangkan pegawai paruh waktu atau menunda rekrutmen.",
    });
  }

  // Penurunan stok langsung memotong penjualan.
  if (
    result.scenarioType === "inventory" &&
    input.scenarioType === "inventory" &&
    input.stockChangePercent < 0 &&
    input.salesChangePercent < 0
  ) {
    recommendations.push({
      tone: "warning",
      text: "Penurunan stok menurunkan penjualan pada asumsi ini. Pastikan item terlaris selalu tersedia sebelum menyesuaikan stok.",
      reason:
        "Kehilangan stok item terlaris memotong profit hampir satu banding satu karena pendapatan hilang tanpa penghematan biaya berarti.",
    });
  }

  return recommendations;
}
