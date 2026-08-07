import type { ScenarioType } from "@/types";
import { parseNumberInput } from "@/lib/validation/transactions";

export interface ParsedInput {
  scenarioType: ScenarioType;
  values: Record<string, number>;
}

const PERCENT = "(\\d+(?:[.,]\\d+)?)\\s*%";
const NUMBER = "(\\d+(?:[.,]\\d+)*)";

// Regex pattern matching untuk pola kalimat umum, bukan NLP.
// Pola tidak dikenali dikembalikan null, UI lalu mengarahkan ke form biasa.
export function parseNaturalInput(text: string): ParsedInput | null {
  const input = text.toLowerCase();

  const discount = input.match(new RegExp(`diskon\\s+${PERCENT}`));
  if (discount) {
    return {
      scenarioType: "discount",
      values: { discountPercent: parseNumberInput(discount[1]) },
    };
  }

  const priceChange = input.match(
    new RegExp(`harga\\s+dari\\s+${NUMBER}\\s+(?:menjadi|jadi|ke)\\s+${NUMBER}`)
  );
  if (priceChange) {
    return {
      scenarioType: "pricing",
      values: {
        currentPrice: parseNumberInput(priceChange[1]),
        newPrice: parseNumberInput(priceChange[2]),
      },
    };
  }

  const priceTo = input.match(
    new RegExp(`harga\\s+${NUMBER}\\s+(?:menjadi|jadi|ke)\\s+${NUMBER}`)
  );
  if (priceTo) {
    return {
      scenarioType: "pricing",
      values: {
        currentPrice: parseNumberInput(priceTo[1]),
        newPrice: parseNumberInput(priceTo[2]),
      },
    };
  }

  const priceSingleTo = input.match(
    new RegExp(`harga\\s+(?:menjadi|jadi|ke)\\s+${NUMBER}`)
  );
  if (priceSingleTo) {
    return {
      scenarioType: "pricing",
      values: { newPrice: parseNumberInput(priceSingleTo[1]) },
    };
  }

  if (/(?:naikkan?|naik)\s+harga|harga\s+naik/.test(input)) {
    return { scenarioType: "pricing", values: {} };
  }

  if (/(?:tambah|rekrut|pekerjakan)\s+(?:pegawai|karyawan|orang|staf|staff)/.test(input)) {
    return { scenarioType: "staffing", values: {} };
  }

  const stockDown = input.match(
    new RegExp(`stok\\s+(?:turun|berkurang|menurun)\\s+${PERCENT}`)
  );
  if (stockDown) {
    return {
      scenarioType: "inventory",
      values: { stockChangePercent: -parseNumberInput(stockDown[1]) },
    };
  }

  const stockUp = input.match(
    new RegExp(`stok\\s+(?:naik|bertambah|meningkat)\\s+${PERCENT}`)
  );
  if (stockUp) {
    return {
      scenarioType: "inventory",
      values: { stockChangePercent: parseNumberInput(stockUp[1]) },
    };
  }

  return null;
}
