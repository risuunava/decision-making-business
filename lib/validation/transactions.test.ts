import { describe, expect, it } from "vitest";
import {
  isValidDate,
  normalizeDate,
  parseNumberInput,
  validateCsvHeaders,
  validateCsvRows,
} from "./transactions";

describe("normalizeDate", () => {
  it("menerima format YYYY-MM-DD", () => {
    expect(normalizeDate("2026-07-01")).toBe("2026-07-01");
  });

  it("menerima format DD/MM/YYYY", () => {
    expect(normalizeDate("01/07/2026")).toBe("2026-07-01");
  });

  it("menerima format DD-MM-YYYY", () => {
    expect(normalizeDate("01-07-2026")).toBe("2026-07-01");
  });

  it("menerima tanggal satu digit tanpa nol depan", () => {
    expect(normalizeDate("7/8/2026")).toBe("2026-08-07");
  });

  it("menolak format yang tidak dikenal", () => {
    expect(normalizeDate("07-01-26")).toBeNull();
    expect(normalizeDate("Jan 2026")).toBeNull();
  });

  it("mengembalikan null untuk string kosong", () => {
    expect(normalizeDate("")).toBeNull();
  });
});

describe("isValidDate", () => {
  it("menolak tanggal yang tidak ada di kalender", () => {
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("31/02/2026")).toBe(false);
  });

  it("menerima tanggal valid", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
  });
});

describe("parseNumberInput", () => {
  it("menerima angka polos", () => {
    expect(parseNumberInput("15000")).toBe(15000);
  });

  it("menerima angka dengan titik ribuan gaya Indonesia", () => {
    expect(parseNumberInput("15.000")).toBe(15000);
    expect(parseNumberInput("1.000.000")).toBe(1000000);
  });

  it("menerima koma sebagai pemisah desimal", () => {
    expect(parseNumberInput("1,5")).toBe(1.5);
  });

  it("menerima kombinasi ribuan dan desimal", () => {
    expect(parseNumberInput("15.000,5")).toBe(15000.5);
  });

  it("menerima angka bertipe number langsung", () => {
    expect(parseNumberInput(42)).toBe(42);
  });

  it("mengembalikan NaN untuk string kosong atau bukan angka", () => {
    expect(Number.isNaN(parseNumberInput(""))).toBe(true);
    expect(Number.isNaN(parseNumberInput("abc"))).toBe(true);
  });
});

describe("validateCsvHeaders", () => {
  it("menerima header lengkap", () => {
    expect(
      validateCsvHeaders([
        "date",
        "item_name",
        "quantity",
        "unit_price",
        "cost_per_unit",
      ])
    ).toEqual([]);
  });

  it("tidak menganggap BOM sebagai bagian nama kolom", () => {
    expect(
      validateCsvHeaders([
        "\uFEFFdate",
        "item_name",
        "quantity",
        "unit_price",
        "cost_per_unit",
      ])
    ).toEqual([]);
  });

  it("melaporkan kolom yang hilang", () => {
    expect(validateCsvHeaders(["date", "item_name"])).toEqual([
      "quantity",
      "unit_price",
      "cost_per_unit",
    ]);
  });
});

describe("validateCsvRows", () => {
  it("memvalidasi baris lengkap dengan format angka Indonesia", () => {
    const { valid, errors } = validateCsvRows([
      {
        date: "01/07/2026",
        item_name: "Kopi",
        quantity: "10",
        unit_price: "15.000",
        cost_per_unit: "7.000,5",
      },
    ]);
    expect(errors).toEqual([]);
    expect(valid).toEqual([
      {
        date: "2026-07-01",
        item_name: "Kopi",
        quantity: 10,
        unit_price: 15000,
        cost_per_unit: 7000.5,
      },
    ]);
  });

  it("menandai baris rusak beserta nomor baris", () => {
    const { valid, errors } = validateCsvRows([
      { date: "2026-07-01", item_name: "Kopi", quantity: "10", unit_price: "15000", cost_per_unit: "7000" },
      { date: "bukan-tanggal", item_name: "Teh", quantity: "5", unit_price: "5000", cost_per_unit: "2000" },
    ]);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].rowNumber).toBe(3);
    expect(errors[0].message).toContain("date");
  });

  it("menerima format tanggal YYYY-MM-DD dan DD-MM-YYYY bercampur", () => {
    const { valid } = validateCsvRows([
      { date: "2026-07-01", item_name: "A", quantity: "1", unit_price: "100", cost_per_unit: "50" },
      { date: "05-08-2026", item_name: "B", quantity: "2", unit_price: "200", cost_per_unit: "80" },
    ]);
    expect(valid.map((row) => row.date)).toEqual(["2026-07-01", "2026-08-05"]);
  });
});
