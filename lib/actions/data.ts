"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CsvTransactionRow } from "@/types";
import {
  normalizeDate,
  parseNumberInput,
  transactionRowSchema,
} from "@/lib/validation/transactions";

export type DataActionResult = {
  success: boolean;
  message: string;
  inserted?: number;
};

const MAX_ROWS = 5000;
const INSERT_CHUNK_SIZE = 500;

export async function saveTransactions(
  rows: CsvTransactionRow[]
): Promise<DataActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Sesi login berakhir, silakan login ulang." };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) {
    return { success: false, message: "Lengkapi profil bisnis terlebih dahulu." };
  }

  if (rows.length === 0) {
    return { success: false, message: "Tidak ada baris data yang valid." };
  }
  if (rows.length > MAX_ROWS) {
    return {
      success: false,
      message: `Maksimal ${MAX_ROWS} baris per unggahan. File Anda berisi ${rows.length} baris.`,
    };
  }

  const validated: CsvTransactionRow[] = [];
  for (const row of rows) {
    const parsed = transactionRowSchema.safeParse({
      date: normalizeDate(row.date),
      item_name: row.item_name,
      quantity: parseNumberInput(row.quantity),
      unit_price: parseNumberInput(row.unit_price),
      cost_per_unit: parseNumberInput(row.cost_per_unit),
    });
    if (parsed.success) {
      validated.push(parsed.data);
    }
  }

  if (validated.length === 0) {
    return { success: false, message: "Semua baris gagal validasi." };
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("business_id", business.id);
  if (deleteError) {
    return { success: false, message: "Gagal mengganti data lama." };
  }

  for (let i = 0; i < validated.length; i += INSERT_CHUNK_SIZE) {
    const chunk = validated.slice(i, i + INSERT_CHUNK_SIZE).map((row) => ({
      business_id: business.id,
      date: row.date,
      item_name: row.item_name,
      quantity: row.quantity,
      unit_price: row.unit_price,
      cost_per_unit: row.cost_per_unit,
    }));
    const { error: insertError } = await supabase
      .from("transactions")
      .insert(chunk);
    if (insertError) {
      return {
        success: false,
        message: `Gagal menyimpan sebagian data pada batch ${i / INSERT_CHUNK_SIZE + 1}.`,
      };
    }
  }

  revalidatePath("/data");
  revalidatePath("/simulate");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: `${validated.length} baris transaksi tersimpan.`,
    inserted: validated.length,
  };
}
