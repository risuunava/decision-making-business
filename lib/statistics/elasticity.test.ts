import { describe, expect, it } from "vitest";
import {
  estimateElasticity,
  priceVolumePairs,
  MIN_OBSERVATIONS,
  MIN_PRICE_POINTS,
} from "./elasticity";
import type { TransactionWithItem } from "@/lib/analytics/trends";

const transactions: TransactionWithItem[] = [
  { date: "2026-01-03", item_name: "Kopi", quantity: 10, unit_price: 100 },
  { date: "2026-01-05", item_name: "Kopi", quantity: 5, unit_price: 100 },
  { date: "2026-02-02", item_name: "Kopi", quantity: 20, unit_price: 120 },
  { date: "2026-01-02", item_name: "Teh", quantity: 3, unit_price: 50 },
];

describe("priceVolumePairs", () => {
  it("mengelompokkan per item per bulan dengan harga rata-rata tertimbang", () => {
    const pairs = priceVolumePairs(transactions);
    const kopi = pairs.get("Kopi");
    expect(kopi).toHaveLength(2);
    expect(kopi?.[0]).toEqual({ month: "2026-01", price: 100, quantity: 15 });
    expect(kopi?.[1]).toEqual({ month: "2026-02", price: 120, quantity: 20 });
    expect(pairs.get("Teh")).toHaveLength(1);
  });
});

describe("estimateElasticity", () => {
  it("menghitung elastisitas log-log dengan R² sempurna untuk garis lurus", () => {
    const pairs = [
      { month: "2026-01", price: 10, quantity: 100 },
      { month: "2026-02", price: 10, quantity: 100 },
      { month: "2026-03", price: 20, quantity: 50 },
      { month: "2026-04", price: 20, quantity: 50 },
    ];
    const estimate = estimateElasticity("Kopi", pairs);
    expect(estimate).not.toBeNull();
    expect(estimate?.elasticity).toBeCloseTo(-1, 2);
    expect(estimate?.rSquared).toBeCloseTo(1, 2);
    expect(estimate?.n).toBe(4);
    expect(estimate?.itemName).toBe("Kopi");
  });

  it("menolak bila jumlah observasi kurang dari batas minimum", () => {
    const pairs = [
      { month: "2026-01", price: 10, quantity: 100 },
      { month: "2026-02", price: 20, quantity: 50 },
    ];
    expect(pairs.length).toBeLessThan(MIN_OBSERVATIONS);
    expect(estimateElasticity("Kopi", pairs)).toBeNull();
  });

  it("menolak bila harga tidak pernah berubah", () => {
    const pairs = [
      { month: "2026-01", price: 10, quantity: 100 },
      { month: "2026-02", price: 10, quantity: 110 },
      { month: "2026-03", price: 10, quantity: 95 },
    ];
    expect(new Set(pairs.map((pair) => pair.price)).size).toBeLessThan(
      MIN_PRICE_POINTS
    );
    expect(estimateElasticity("Kopi", pairs)).toBeNull();
  });

  it("mengabaikan observasi dengan volume nol", () => {
    const pairs = [
      { month: "2026-01", price: 10, quantity: 100 },
      { month: "2026-02", price: 20, quantity: 0 },
      { month: "2026-03", price: 10, quantity: 90 },
      { month: "2026-04", price: 20, quantity: 45 },
    ];
    const estimate = estimateElasticity("Kopi", pairs);
    expect(estimate).not.toBeNull();
    expect(estimate?.n).toBe(3);
  });
});
