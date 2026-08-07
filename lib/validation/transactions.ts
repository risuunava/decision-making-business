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

export function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (isoDatePattern.test(trimmed)) {
    return trimmed;
  }

  const parts = trimmed.split(/[/\-.]/);
  if (parts.length !== 3) return null;

  const [dayPart, monthPart, yearPart] = parts;
  if (
    !/^\d{1,2}$/.test(dayPart) ||
    !/^\d{1,2}$/.test(monthPart) ||
    !/^\d{4}$/.test(yearPart)
  ) {
    return null;
  }

  const day = Number(dayPart);
  const month = Number(monthPart);
  const year = Number(yearPart);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isValidDate(value: string): boolean {
  const normalized = normalizeDate(value);
  if (!normalized) return false;
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
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

  const trimmed = String(value ?? "").trim().replace(/\s/g, "");
  if (trimmed === "") return Number.NaN;

  let normalized: string;
  if (trimmed.includes(",")) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = trimmed.replace(/\./g, "");
  }

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
  const normalized = headers.map((header) =>
    String(header ?? "").replace(/^\uFEFF/, "").trim()
  );
  return CSV_EXPECTED_HEADERS.filter(
    (expected) => !normalized.includes(expected)
  );
}
