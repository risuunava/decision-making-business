import type { BusinessType, ScenarioType } from "@/types";

export const SCENARIO_LABEL: Record<ScenarioType, string> = {
  pricing: "Kenaikan Harga",
  discount: "Diskon",
  staffing: "Tambah Pegawai",
  inventory: "Penyesuaian Stok",
};

export const SCENARIO_VERB: Record<ScenarioType, string> = {
  pricing: "penyesuaian harga",
  discount: "diskon",
  staffing: "penambahan pegawai",
  inventory: "penyesuaian stok",
};

export const BUSINESS_TYPE_LABEL: Record<BusinessType, string> = {
  "f&b": "F&B",
  retail: "Retail",
  jasa: "Jasa",
  lainnya: "Lainnya",
};

export const CURRENCY_OPTIONS = ["IDR", "USD", "SGD", "MYR"] as const;

export function formatMoney(value: number, currency = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
