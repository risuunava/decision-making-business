import { describe, expect, it } from "vitest";
import { buildInsights } from "./templates";
import type { SimulationResult } from "@/types";

function result(
  scenarioType: SimulationResult["scenarioType"],
  profitChangePercent: number
): SimulationResult {
  return {
    scenarioType,
    profitBefore: 1000,
    profitAfter: 1000 * (1 + profitChangePercent / 100),
    profitChange: 1000 * (profitChangePercent / 100),
    profitChangePercent,
    marginBefore: 50,
    marginAfter: 50,
    breakeven: null,
  };
}

describe("buildInsights", () => {
  it("menghasilkan verdict positif untuk profit naik", () => {
    const insights = buildInsights(result("pricing", 10));
    expect(insights[0].tone).toBe("positive");
    expect(insights[0].text).toContain("10,0%");
  });

  it("menghasilkan verdict negatif untuk profit turun", () => {
    const insights = buildInsights(result("discount", -10));
    expect(insights[0].tone).toBe("negative");
  });

  it("verdict bervariasi antar skenario untuk hasil yang sama", () => {
    const pricing = buildInsights(result("pricing", 10));
    const discount = buildInsights(result("discount", 10));
    expect(pricing[0].text).not.toBe(discount[0].text);
  });

  it("selalu diakhiri disclaimer asumsi", () => {
    const insights = buildInsights(result("staffing", 0));
    expect(insights[insights.length - 1].tone).toBe("info");
    expect(insights[insights.length - 1].text).toContain("asumsi");
  });
});
