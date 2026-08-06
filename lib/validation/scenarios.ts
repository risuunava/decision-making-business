import { z } from "zod";

function numberField(label: string, min: number, minMessage: string) {
  return z
    .number({ error: `${label} wajib diisi angka.` })
    .finite(`${label} bukan angka yang valid.`)
    .min(min, minMessage);
}

export const pricingSchema = z.object({
  scenarioType: z.literal("pricing"),
  currentPrice: numberField("Harga saat ini", 1, "Harga saat ini minimal 1."),
  newPrice: numberField("Harga baru", 1, "Harga baru minimal 1."),
  currentVolume: numberField(
    "Volume saat ini",
    1,
    "Volume saat ini minimal 1."
  ),
  costPerUnit: numberField("Biaya per unit", 0, "Biaya per unit tidak boleh negatif."),
  volumeChangePercent: numberField(
    "Perubahan volume",
    -99.99,
    "Perubahan volume minimal -99,99%."
  ),
});

export const discountSchema = z.object({
  scenarioType: z.literal("discount"),
  currentPrice: numberField("Harga saat ini", 1, "Harga saat ini minimal 1."),
  discountPercent: numberField(
    "Persentase diskon",
    0,
    "Persentase diskon minimal 0%."
  ).max(95, "Persentase diskon maksimal 95%."),
  currentVolume: numberField(
    "Volume saat ini",
    1,
    "Volume saat ini minimal 1."
  ),
  costPerUnit: numberField("Biaya per unit", 0, "Biaya per unit tidak boleh negatif."),
  volumeIncreasePercent: numberField(
    "Kenaikan volume",
    0,
    "Kenaikan volume tidak boleh negatif."
  ),
});

export const staffingSchema = z.object({
  scenarioType: z.literal("staffing"),
  currentMonthlyRevenue: numberField(
    "Omzet bulanan saat ini",
    1,
    "Omzet bulanan minimal 1."
  ),
  grossMarginPercent: numberField(
    "Margin kotor",
    0,
    "Margin kotor minimal 0%."
  ).max(90, "Margin kotor maksimal 90%."),
  additionalMonthlyCost: numberField(
    "Biaya tambahan bulanan",
    0,
    "Biaya tambahan tidak boleh negatif."
  ),
  revenueIncreasePercent: numberField(
    "Kenaikan omzet",
    0,
    "Kenaikan omzet tidak boleh negatif."
  ),
});

export const inventorySchema = z.object({
  scenarioType: z.literal("inventory"),
  currentVolume: numberField(
    "Volume saat ini",
    1,
    "Volume saat ini minimal 1."
  ),
  unitPrice: numberField("Harga jual per unit", 1, "Harga minimal 1."),
  costPerUnit: numberField("Biaya per unit", 0, "Biaya per unit tidak boleh negatif."),
  stockChangePercent: numberField(
    "Perubahan stok",
    -100,
    "Perubahan stok minimal -100%."
  ),
  salesChangePercent: numberField(
    "Perubahan penjualan",
    -100,
    "Perubahan penjualan minimal -100%."
  ),
});

export const scenarioSchema = z.discriminatedUnion("scenarioType", [
  pricingSchema,
  discountSchema,
  staffingSchema,
  inventorySchema,
]);
