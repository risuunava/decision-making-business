import type { ScenarioType } from "@/types";

export type FieldKind = "money" | "percent" | "quantity";

export interface ScenarioField {
  name: string;
  label: string;
  hint?: string;
  kind: FieldKind;
  min?: number;
}

export const SCENARIO_FIELDS: Record<ScenarioType, ScenarioField[]> = {
  pricing: [
    {
      name: "currentPrice",
      label: "Harga Saat Ini",
      kind: "money",
    },
    {
      name: "newPrice",
      label: "Harga Baru",
      kind: "money",
    },
    {
      name: "currentVolume",
      label: "Volume Penjualan Saat Ini",
      hint: "Jumlah unit terjual dalam satu periode.",
      kind: "quantity",
    },
    {
      name: "costPerUnit",
      label: "Biaya Per Unit",
      kind: "money",
    },
    {
      name: "volumeChangePercent",
      label: "Estimasi Perubahan Volume",
      hint: "Perkiraan dampak kenaikan harga terhadap unit terjual. Gunakan angka negatif bila pelanggan berkurang.",
      kind: "percent",
      min: -99.99,
    },
  ],
  discount: [
    {
      name: "currentPrice",
      label: "Harga Saat Ini",
      kind: "money",
    },
    {
      name: "discountPercent",
      label: "Persentase Diskon",
      kind: "percent",
    },
    {
      name: "currentVolume",
      label: "Volume Penjualan Saat Ini",
      hint: "Jumlah unit terjual dalam satu periode.",
      kind: "quantity",
    },
    {
      name: "costPerUnit",
      label: "Biaya Per Unit",
      kind: "money",
    },
    {
      name: "volumeIncreasePercent",
      label: "Estimasi Kenaikan Volume",
      hint: "Perkiraan kenaikan unit terjual karena diskon.",
      kind: "percent",
    },
  ],
  staffing: [
    {
      name: "currentMonthlyRevenue",
      label: "Omzet Bulanan Saat Ini",
      kind: "money",
    },
    {
      name: "grossMarginPercent",
      label: "Margin Kotor",
      hint: "Persentase omzet yang tersisa setelah biaya produk.",
      kind: "percent",
    },
    {
      name: "additionalMonthlyCost",
      label: "Biaya Tambahan Bulanan",
      hint: "Gaji dan biaya lain pegawai baru per bulan.",
      kind: "money",
    },
    {
      name: "revenueIncreasePercent",
      label: "Estimasi Kenaikan Omzet",
      kind: "percent",
    },
  ],
  inventory: [
    {
      name: "currentVolume",
      label: "Volume Penjualan Saat Ini",
      hint: "Jumlah unit terjual dalam satu periode.",
      kind: "quantity",
    },
    {
      name: "unitPrice",
      label: "Harga Jual Per Unit",
      kind: "money",
    },
    {
      name: "costPerUnit",
      label: "Biaya Per Unit",
      kind: "money",
    },
    {
      name: "stockChangePercent",
      label: "Perubahan Stok",
      hint: "Estimasi perubahan ketersediaan stok.",
      kind: "percent",
      min: -100,
    },
    {
      name: "salesChangePercent",
      label: "Dampak ke Penjualan",
      hint: "Perkiraan perubahan unit terjual akibat perubahan stok.",
      kind: "percent",
      min: -100,
    },
  ],
};

export const SCENARIO_DESCRIPTION: Record<ScenarioType, string> = {
  pricing:
    "Ubah harga jual dan lihat dampaknya terhadap profit dengan asumsi perubahan volume penjualan.",
  discount:
    "Berikan diskon dan cari tahu berapa kenaikan volume yang dibutuhkan agar profit tidak turun.",
  staffing:
    "Tambah pegawai dan hitung berapa kenaikan omzet yang diperlukan untuk menutup biaya baru.",
  inventory:
    "Sesuaikan stok dan lihat dampak perubahan volume penjualan terhadap profit.",
};
