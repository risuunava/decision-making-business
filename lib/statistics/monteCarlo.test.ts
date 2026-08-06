import { describe, expect, it } from "vitest";
import {
  monteCarloProfit,
  percentile,
  volumeChangeSeries,
} from "./monteCarlo";

describe("volumeChangeSeries", () => {
  it("menghitung perubahan persen antar bulan berurutan", () => {
    const volumes = [
      { month: "2026-01", quantity: 100 },
      { month: "2026-02", quantity: 110 },
      { month: "2026-03", quantity: 99 },
    ];
    expect(volumeChangeSeries(volumes)).toEqual([10, -10]);
  });

  it("melewatkan bulan sebelumnya yang volumenya nol", () => {
    const volumes = [
      { month: "2026-01", quantity: 0 },
      { month: "2026-02", quantity: 10 },
    ];
    expect(volumeChangeSeries(volumes)).toEqual([]);
  });
});

describe("monteCarloProfit", () => {
  it("menghasilkan profit deterministik dengan rng tetap", () => {
    const changes = [10, -5];
    const profits = monteCarloProfit(
      changes,
      100,
      120,
      60,
      4,
      () => 0.1
    );
    expect(profits).toHaveLength(4);
    expect(profits.every((profit) => profit === 6600)).toBe(true);
  });

  it("hasil terurut naik", () => {
    const changes = [10, -5];
    const profits = monteCarloProfit(changes, 100, 120, 60, 50);
    for (let i = 1; i < profits.length; i++) {
      expect(profits[i]).toBeGreaterThanOrEqual(profits[i - 1]);
    }
  });

  it("volume tidak pernah negatif", () => {
    const changes = [-100];
    const profits = monteCarloProfit(changes, 100, 120, 60, 3, () => 0);
    expect(profits.every((profit) => profit >= 0)).toBe(true);
  });
});

describe("percentile", () => {
  it("menghitung persentil dari data terurut", () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(sorted, 10)).toBe(2);
    expect(percentile(sorted, 90)).toBe(9);
  });

  it("mengembalikan 0 untuk data kosong", () => {
    expect(percentile([], 50)).toBe(0);
  });
});
