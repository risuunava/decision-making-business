"use client";

import { useActionState } from "react";
import Image from "next/image";
import { signIn, signUp } from "@/lib/actions/auth";
import type { AuthActionResult } from "@/lib/actions/auth";
import { Field } from "@/components/field";
import { Button } from "@/components/button";
import Link from "next/link";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "register";
  next?: string;
}) {
  const [state, formAction, pending] = useActionState<
    AuthActionResult | null,
    FormData
  >(
    async (_prev, formData) => {
      if (mode === "register") {
        const password = String(formData.get("password") ?? "");
        const confirm = String(formData.get("confirmPassword") ?? "");
        if (password !== confirm) {
          return { success: false, message: "Konfirmasi kata sandi tidak cocok." };
        }
        return await signUp(formData);
      }
      return await signIn(formData, next);
    },
    null
  );

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <Image
          src="/assets/dflogo.png"
          alt="DecideFirst"
          width={32}
          height={32}
          priority
        />
        <h2 className="text-[20px] font-semibold text-ink">
          {mode === "login" ? "Masuk" : "Daftar Akun Baru"}
        </h2>
        <p className="mt-1 text-[13px] text-sub">
          {mode === "login"
            ? "Masuk untuk melanjutkan simulasi keputusan bisnis."
            : "Buat akun gratis untuk mulai mensimulasikan keputusan bisnis."}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@bisnis.com"
        />
        <Field
          name="password"
          label="Kata Sandi"
          type="password"
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
          required
          minLength={6}
          placeholder="Minimal 6 karakter"
        />
        {mode === "register" ? (
          <Field
            name="confirmPassword"
            label="Ulangi Kata Sandi"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
          />
        ) : null}

        {state?.message ? (
          <p
            className={`text-[13px] ${
              state.success ? "text-pos" : "text-neg"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending
            ? "Memproses..."
            : mode === "login"
              ? "Masuk"
              : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-sub">
        {mode === "login" ? (
          <>
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
              Daftar
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
              Masuk
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
