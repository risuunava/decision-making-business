import { z } from "zod";
import type { CsvTransactionRow } from "@/types";

export const CSV_EXPECTED_HEADERS = [
  "date",
  "item_name",
  "quantity",
  "unit_price",
  "cost_per_unit",
] as const;

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dmyDatePattern = /^\d{2}\/\d{2}\/\d{4}$/;

export function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (isoDatePattern.test(trimmed)) {
    return trimmed;
  }
  const dmyMatch = trimmed.match(dmyDatePattern);
  if (dmyMatch) {
    const [day, month, year] = trimmed.split("/");
    return `${year}-${month}-${day}`;
  }
  return null;
}

export function isValidDate(value: string): boolean {
  if (!normalizeDate(value)) return false;
  const normalized = normalizeDate(value)!;
  const date = new Date(`${normalized}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === normalized
  );
}

export const transactionRowSchema = z.object({
  date: z
    .string({ error: "Kolom date wajib diisi." })
    .refine(isValidDate, "Format tanggal salah. Pakai YYYY-MM-DD atau DD/MM/YYYY."),
  item_name: z
    .string({ error: "Kolom item_name wajib diisi." })
    .trim()
    .min(1, "Nama item tidak boleh kosong.")
    .max(200, "Nama item maksimal 200 karakter."),
  quantity: z
    .number({ error: "quantity harus berupa angka." })
    .finite("quantity bukan angka valid.")
    .positive("quantity harus lebih dari 0."),
  unit_price: z
    .number({ error: "unit_price harus berupa angka." })
    .finite("unit_price bukan angka valid.")
    .nonnegative("unit_price tidak boleh negatif."),
  cost_per_unit: z
    .number({ error: "cost_per_unit harus berupa angka." })
    .finite("cost_per_unit bukan angka valid.")
    .nonnegative("cost_per_unit tidak boleh negatif."),
});

export function parseNumberInput(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const trimmed = String(value ?? "").trim();
  if (trimmed === "") return Number.NaN;
  const normalized = trimmed.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function validateCsvRows(rows: unknown[]): {
  valid: CsvTransactionRow[];
  errors: { rowNumber: number; message: string }[];
} {
  const valid: CsvTransactionRow[] = [];
  const errors: { rowNumber: number; message: string }[] = [];

  rows.forEach((row, index) => {
    const record = row as Record<string, unknown>;
    const parsed = transactionRowSchema.safeParse({
      date: normalizeDate(String(record.date ?? "")),
      item_name: String(record.item_name ?? ""),
      quantity: parseNumberInput(record.quantity),
      unit_price: parseNumberInput(record.unit_price),
      cost_per_unit: parseNumberInput(record.cost_per_unit),
    });

    if (parsed.success) {
      valid.push({
        date: normalizeDate(String(record.date ?? ""))!,
        item_name: parsed.data.item_name,
        quantity: parsed.data.quantity,
        unit_price: parsed.data.unit_price,
        cost_per_unit: parsed.data.cost_per_unit,
      });
    } else {
      const firstIssue = parsed.error.issues[0];
      const field = String(firstIssue?.path[0] ?? "");
      errors.push({
        rowNumber: index + 2,
        message: firstIssue ? `${field}: ${firstIssue.message}` : "Baris tidak valid.",
      });
    }
  });

  return { valid, errors };
}

export function validateCsvHeaders(headers: unknown[]): string[] {
  const normalized = headers.map((header) => String(header ?? "").trim());
  return CSV_EXPECTED_HEADERS.filter(
    (expected) => !normalized.includes(expected)
  );
}
