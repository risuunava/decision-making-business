import { describe, expect, it } from "vitest";
import {
  monthlyRevenue,
  monthlyVolume,
  revenueGrowthPercent,
  summaryStats,
  topItems,
} from "./trends";
import type { TransactionLike, TransactionWithItem } from "./trends";

const transactions: TransactionLike[] = [
  { date: "2026-06-05", quantity: 10, unit_price: 100 },
  { date: "2026-06-12", quantity: 5, unit_price: 100 },
  { date: "2026-07-02", quantity: 20, unit_price: 120 },
];

const withItems: TransactionWithItem[] = [
  { date: "2026-06-05", quantity: 10, unit_price: 100, item_name: "Kopi" },
  { date: "2026-06-06", quantity: 5, unit_price: 100, item_name: "Kopi" },
  { date: "2026-06-07", quantity: 3, unit_price: 50, item_name: "Teh" },
];

describe("monthlyRevenue", () => {
  it("mengelompokkan omzet per bulan dan mengurutkan naik", () => {
    expect(monthlyRevenue(transactions)).toEqual([
      { month: "2026-06", revenue: 1500 },
      { month: "2026-07", revenue: 2400 },
    ]);
  });

  it("mengembalikan array kosong untuk data kosong", () => {
    expect(monthlyRevenue([])).toEqual([]);
  });
});

describe("monthlyVolume", () => {
  it("menjumlahkan quantity per bulan", () => {
    expect(monthlyVolume(transactions)).toEqual([
      { month: "2026-06", quantity: 15 },
      { month: "2026-07", quantity: 20 },
    ]);
  });
});

describe("revenueGrowthPercent", () => {
  it("menghitung pertumbuhan antar bulan", () => {
    expect(revenueGrowthPercent(2400, 1500)).toBe(60);
  });

  it("mengembalikan null jika bulan sebelumnya nol", () => {
    expect(revenueGrowthPercent(2400, 0)).toBeNull();
  });

  it("menangani omzet menurun sebagai persentase negatif", () => {
    expect(revenueGrowthPercent(1200, 1500)).toBe(-20);
  });
});

describe("topItems", () => {
  it("mengurutkan item berdasarkan omzet dan membatasi jumlah", () => {
    const result = topItems(withItems, 1);
    expect(result).toEqual([
      { item_name: "Kopi", revenue: 1500, quantity: 15 },
    ]);
  });

  it("mengembalikan semua item jika limit besar", () => {
    expect(topItems(withItems, 10)).toHaveLength(2);
  });
});

describe("summaryStats", () => {
  it("menghitung ringkasan deskriptif", () => {
    expect(summaryStats(transactions)).toEqual({
      totalTransactions: 3,
      totalRevenue: 3900,
      totalQuantity: 35,
      averageTransactionValue: 1300,
      averageMonthlyRevenue: 1950,
    });
  });

  it("mengembalikan nol untuk data kosong tanpa error", () => {
    expect(summaryStats([])).toEqual({
      totalTransactions: 0,
      totalRevenue: 0,
      totalQuantity: 0,
      averageTransactionValue: 0,
      averageMonthlyRevenue: 0,
    });
  });
});
