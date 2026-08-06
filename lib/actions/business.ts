"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type BusinessActionResult = {
  success: boolean;
  message: string;
  businessId?: string;
};

const businessSchema = z.object({
  name: z.string().trim().min(1, "Nama bisnis wajib diisi").max(100),
  businessType: z.enum(["f&b", "retail", "jasa", "lainnya"]),
  currency: z.enum(["IDR", "USD", "SGD", "MYR"]),
});

export async function createBusiness(
  formData: FormData
): Promise<BusinessActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Sesi login berakhir, silakan login ulang." };
  }

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    businessType: formData.get("businessType"),
    currency: formData.get("currency"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input onboarding tidak valid.",
    };
  }

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Profil bisnis sudah ada." };
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      business_type: parsed.data.businessType,
      currency: parsed.data.currency,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: "Gagal menyimpan profil bisnis." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/simulate");
  return { success: true, message: "Profil bisnis tersimpan.", businessId: data.id };
}
