"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult = {
  success: boolean;
  message: string;
};

function authErrorMessage(error: { message?: string } | null): string {
  if (!error) return "Terjadi kesalahan. Coba lagi.";
  const message = error.message ?? "";
  if (message.includes("Invalid login credentials")) {
    return "Email atau kata sandi salah.";
  }
  if (message.includes("Email not confirmed")) {
    return "Email belum dikonfirmasi. Periksa kotak masuk Anda.";
  }
  if (message.includes("User already registered")) {
    return "Email sudah terdaftar. Silakan masuk.";
  }
  if (message.includes("Password should be at least")) {
    return "Kata sandi minimal 6 karakter.";
  }
  return message;
}

export async function signIn(
  formData: FormData,
  next?: string
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: authErrorMessage(error) };
  }

  redirect(next || "/dashboard");
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, message: authErrorMessage(error) };
  }

  if (!data.user || (data.user.identities?.length ?? 0) === 0) {
    return {
      success: true,
      message:
        "Pendaftaran berhasil. Periksa email Anda untuk konfirmasi, lalu masuk.",
    };
  }

  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
