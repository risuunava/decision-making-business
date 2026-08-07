import type { BusinessType } from "@/types";

export interface BenchmarkEntry {
  grossMarginRange: { min: number; max: number };
  netMarginRange: { min: number; max: number };
  priceElasticityNote: string;
  notes: string;
}

export const BENCHMARK_SOURCE_NOTE =
  "Estimasi umum industri dari riset publik, bukan dari data bisnis Anda. Gunakan hanya sebagai referensi saat mengisi asumsi.";

export const BENCHMARKS: Record<BusinessType, BenchmarkEntry> = {
  "f&b": {
    grossMarginRange: { min: 60, max: 75 },
    netMarginRange: { min: 5, max: 15 },
    priceElasticityNote:
      "Elastisitas harga umum F&B biasanya berkisar -1 sampai -2. Kenaikan 10% harga cenderung menurunkan permintaan sekitar 10 sampai 20%.",
    notes:
      "Margin kotor F&B didominasi biaya bahan baku dan tenaga kerja. Kenaikan harga di atas 10% berisiko menggeser pelanggan ke kompetitor.",
  },
  retail: {
    grossMarginRange: { min: 20, max: 50 },
    netMarginRange: { min: 3, max: 10 },
    priceElasticityNote:
      "Elastisitas harga umum retail biasanya berkisar -1 sampai -3. Kenaikan harga lebih sensitif pada barang kebutuhan harian.",
    notes:
      "Margin retail sangat tergantung jenis barang. Barang kebutuhan pokok lebih sensitif harga dibanding barang premium.",
  },
  jasa: {
    grossMarginRange: { min: 50, max: 80 },
    netMarginRange: { min: 10, max: 25 },
    priceElasticityNote:
      "Jasa cenderung kurang elastis terhadap harga, umumnya -0.5 sampai -1.5, karena keterikatan pelanggan lebih kuat.",
    notes:
      "Biaya utama jasa adalah tenaga kerja, bukan barang. Kenaikan harga bisa lebih mudah diterima bila layanan terdiferensiasi.",
  },
  lainnya: {
    grossMarginRange: { min: 30, max: 70 },
    netMarginRange: { min: 5, max: 20 },
    priceElasticityNote:
      "Elastisitas harga sangat bervariasi antar kategori. Riset publik mencatat rentang umum -0.5 sampai -2.",
    notes:
      "Gunakan rentang ini dengan hati-hati. Kategori usaha lain perlu referensi lebih spesifik sesuai industrinya.",
  },
};
