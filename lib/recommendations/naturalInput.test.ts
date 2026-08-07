import { describe, expect, it } from "vitest";
import { parseNaturalInput } from "./naturalInput";

describe("parseNaturalInput", () => {
  it("memahami diskon 10%", () => {
    expect(parseNaturalInput("diskon 10%")).toEqual({
      scenarioType: "discount",
      values: { discountPercent: 10 },
    });
  });

  it("memahami variasi kalimat diskon", () => {
    expect(parseNaturalInput("beri diskon 15,5% sekarang")).toEqual({
      scenarioType: "discount",
      values: { discountPercent: 15.5 },
    });
  });

  it("memahami harga dari A jadi B", () => {
    expect(parseNaturalInput("harga dari 100 jadi 120")).toEqual({
      scenarioType: "pricing",
      values: { currentPrice: 100, newPrice: 120 },
    });
  });

  it("memahami harga dengan ribuan separator", () => {
    expect(parseNaturalInput("harga 100.000 menjadi 120.000")).toEqual({
      scenarioType: "pricing",
      values: { currentPrice: 100000, newPrice: 120000 },
    });
  });

  it("memahami naikkan harga menjadi", () => {
    expect(parseNaturalInput("naikkan harga jadi 150")).toEqual({
      scenarioType: "pricing",
      values: { newPrice: 150 },
    });
  });

  it("memahami naikkan harga tanpa angka sebagai pengalih tipe", () => {
    expect(parseNaturalInput("naikkan harga 10%")).toEqual({
      scenarioType: "pricing",
      values: {},
    });
  });

  it("memahami tambah pegawai", () => {
    expect(parseNaturalInput("saya mau tambah karyawan 1 orang")).toEqual({
      scenarioType: "staffing",
      values: {},
    });
  });

  it("memahami stok turun", () => {
    expect(parseNaturalInput("stok turun 20%")).toEqual({
      scenarioType: "inventory",
      values: { stockChangePercent: -20 },
    });
  });

  it("memahami stok naik", () => {
    expect(parseNaturalInput("stok naik 10%")).toEqual({
      scenarioType: "inventory",
      values: { stockChangePercent: 10 },
    });
  });

  it("mengembalikan null untuk kalimat yang tidak dikenali", () => {
    expect(parseNaturalInput("bagaimana cara menambah profit?")).toBeNull();
  });
});
