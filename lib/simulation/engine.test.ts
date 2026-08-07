import { describe, expect, it } from "vitest";
import {
  calculateMargin,
  calculateProfit,
  calculateProfitImpact,
  round,
} from "./engine";

describe("round", () => {
  it("membulatkan ke 2 desimal", () => {
    expect(round(1.005)).toBe(1.01);
    expect(round(33.333333)).toBe(33.33);
  });
});

describe("calculateProfit", () => {
  it("profit = (harga - cost) x volume", () => {
    expect(calculateProfit(100, 60, 100)).toBe(4000);
    expect(calculateProfit(120, 60, 90)).toBe(5400);
  });
});

describe("calculateMargin", () => {
  it("margin dalam persen", () => {
    expect(calculateMargin(100, 60)).toBe(40);
    expect(calculateMargin(120, 60)).toBe(50);
  });
  it("harga tidak valid mengembalikan 0", () => {
    expect(calculateMargin(0, 60)).toBe(0);
  });
});

describe("calculateProfitImpact: pricing", () => {
  const input = {
    scenarioType: "pricing" as const,
    currentPrice: 100,
    newPrice: 120,
    currentVolume: 100,
    costPerUnit: 60,
    volumeChangePercent: -10,
  };

  it("menghitung profit sebelum dan sesudah", () => {
    const result = calculateProfitImpact(input);
    expect(result.profitBefore).toBe(4000);
    expect(result.profitAfter).toBe(5400);
    expect(result.profitChange).toBe(1400);
    expect(result.profitChangePercent).toBe(35);
  });

  it("menghitung margin sebelum dan sesudah", () => {
    const result = calculateProfitImpact(input);
    expect(result.marginBefore).toBe(40);
    expect(result.marginAfter).toBe(50);
  });

  it("breakeven = maksimum penurunan volume", () => {
    const result = calculateProfitImpact(input);
    expect(result.breakeven?.metric).toBe("maxVolumeDrop");
    expect(result.breakeven?.value).toBe(33.33);
  });

  it("penurunan volume besar menghasilkan profit turun", () => {
    const result = calculateProfitImpact({
      ...input,
      volumeChangePercent: -50,
    });
    expect(result.profitAfter).toBe(3000);
    expect(result.profitChangePercent).toBe(-25);
  });

  it("harga baru di bawah cost tidak punya breakeven", () => {
    const result = calculateProfitImpact({
      ...input,
      newPrice: 50,
    });
    expect(result.breakeven).toBeNull();
    expect(result.profitAfter).toBeLessThan(0);
  });
});

describe("calculateProfitImpact: discount", () => {
  const input = {
    scenarioType: "discount" as const,
    currentPrice: 100,
    discountPercent: 10,
    currentVolume: 100,
    costPerUnit: 60,
    volumeIncreasePercent: 20,
  };

  it("menghitung harga diskon dan profit", () => {
    const result = calculateProfitImpact(input);
    expect(result.profitBefore).toBe(4000);
    expect(result.profitAfter).toBe(3600);
    expect(result.profitChange).toBe(-400);
    expect(result.profitChangePercent).toBe(-10);
    expect(result.marginAfter).toBe(33.33);
  });

  it("breakeven = kenaikan volume minimum", () => {
    const result = calculateProfitImpact(input);
    expect(result.breakeven?.metric).toBe("minVolumeIncrease");
    expect(result.breakeven?.value).toBe(33.33);
  });

  it("diskon dalam (harga di bawah cost) tidak punya breakeven", () => {
    const result = calculateProfitImpact({ ...input, discountPercent: 50 });
    expect(result.breakeven).toBeNull();
  });
});

describe("calculateProfitImpact: staffing", () => {
  const input = {
    scenarioType: "staffing" as const,
    currentMonthlyRevenue: 10_000_000,
    grossMarginPercent: 40,
    additionalMonthlyCost: 1_000_000,
    revenueIncreasePercent: 15,
  };

  it("menghitung kontribusi profit sebelum dan sesudah", () => {
    const result = calculateProfitImpact(input);
    expect(result.profitBefore).toBe(4_000_000);
    expect(result.profitAfter).toBe(3_600_000);
    expect(result.profitChange).toBe(-400_000);
    expect(result.profitChangePercent).toBe(-10);
  });

  it("breakeven = kenaikan omzet minimum", () => {
    const result = calculateProfitImpact(input);
    expect(result.breakeven?.metric).toBe("minRevenueIncrease");
    expect(result.breakeven?.value).toBe(25);
  });

  it("kenaikan omzet tinggi menghasilkan profit naik", () => {
    const result = calculateProfitImpact({
      ...input,
      revenueIncreasePercent: 30,
    });
    expect(result.profitAfter).toBe(4_200_000);
    expect(result.profitChangePercent).toBe(5);
  });

  it("margin tidak valid tidak punya breakeven", () => {
    const result = calculateProfitImpact({ ...input, grossMarginPercent: 0 });
    expect(result.breakeven).toBeNull();
  });
});

describe("calculateProfitImpact: inventory", () => {
  const input = {
    scenarioType: "inventory" as const,
    currentVolume: 100,
    unitPrice: 100,
    costPerUnit: 60,
    stockChangePercent: -30,
    salesChangePercent: -10,
  };

  it("menghitung profit sesuai efek penjualan", () => {
    const result = calculateProfitImpact(input);
    expect(result.profitBefore).toBe(4000);
    expect(result.profitAfter).toBe(3600);
    expect(result.profitChangePercent).toBe(-10);
    expect(result.marginBefore).toBe(40);
    expect(result.marginAfter).toBe(40);
  });

  it("breakeven netral di 0% efek penjualan", () => {
    const result = calculateProfitImpact(input);
    expect(result.breakeven?.value).toBe(0);
    expect(result.breakeven?.metric).toBe("maxVolumeDrop");
  });
});
