import { describe, expect, it } from "vitest";
import { buildRecommendations } from "./decisionTree";
import { calculateProfitImpact } from "@/lib/simulation/engine";
import type { ScenarioInput } from "@/types";

function simulate(input: ScenarioInput) {
  return buildRecommendations(calculateProfitImpact(input), "f&b", input);
}

describe("buildRecommendations", () => {
  it("menyarankan tinjau ulang saat kenaikan harga menurunkan profit", () => {
    const recommendations = simulate({
      scenarioType: "pricing",
      currentPrice: 100,
      newPrice: 110,
      currentVolume: 100,
      costPerUnit: 80,
      volumeChangePercent: -40,
    });
    expect(recommendations.some((r) => r.text.includes("Tinjau ulang"))).toBe(true);
  });

  it("mengingatkan asumsi optimistis saat penurunan volume di bawah 5%", () => {
    const recommendations = simulate({
      scenarioType: "pricing",
      currentPrice: 100,
      newPrice: 110,
      currentVolume: 100,
      costPerUnit: 30,
      volumeChangePercent: -5,
    });
    expect(recommendations.some((r) => r.text.includes("optimistis"))).toBe(true);
  });

  it("memperingatkan diskon di bawah biaya per unit", () => {
    const recommendations = simulate({
      scenarioType: "discount",
      currentPrice: 100,
      discountPercent: 30,
      currentVolume: 100,
      costPerUnit: 75,
      volumeIncreasePercent: 20,
    });
    expect(
      recommendations.some(
        (r) => r.tone === "negative" && r.text.includes("di bawah biaya")
      )
    ).toBe(true);
  });

  it("menyarankan paruh waktu saat target omzet impas di atas 30%", () => {
    const recommendations = simulate({
      scenarioType: "staffing",
      currentMonthlyRevenue: 10_000_000,
      grossMarginPercent: 20,
      additionalMonthlyCost: 1_000_000,
      revenueIncreasePercent: 10,
    });
    expect(
      recommendations.some((r) => r.reason.includes("paruh waktu"))
    ).toBe(true);
  });

  it("memperingatkan penurunan stok yang memotong penjualan", () => {
    const recommendations = simulate({
      scenarioType: "inventory",
      currentVolume: 100,
      unitPrice: 100,
      costPerUnit: 60,
      stockChangePercent: -20,
      salesChangePercent: -20,
    });
    expect(recommendations[0].tone).toBe("warning");
  });

  it("menyoroti margin di bawah benchmark industri", () => {
    const recommendations = simulate({
      scenarioType: "pricing",
      currentPrice: 100,
      newPrice: 110,
      currentVolume: 100,
      costPerUnit: 90,
      volumeChangePercent: -10,
    });
    expect(recommendations.some((r) => r.text.includes("Margin kotor"))).toBe(
      true
    );
  });

  it("tidak memberi rekomendasi untuk skenario yang sehat", () => {
    const recommendations = simulate({
      scenarioType: "pricing",
      currentPrice: 100,
      newPrice: 110,
      currentVolume: 100,
      costPerUnit: 40,
      volumeChangePercent: -10,
    });
    expect(recommendations).toEqual([]);
  });
});
