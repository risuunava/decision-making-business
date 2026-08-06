"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBusiness } from "@/lib/actions/business";
import type { BusinessActionResult } from "@/lib/actions/business";
import { BUSINESS_TYPE_LABEL, CURRENCY_OPTIONS } from "@/lib/constants";
import { Field, SelectField } from "@/components/field";
import { Button } from "@/components/button";

export function OnboardingForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    BusinessActionResult | null,
    FormData
  >(async (_prev, formData) => createBusiness(formData), null);

  useEffect(() => {
    if (state?.success) {
      router.push("/simulate");
    }
  }, [state, router]);

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card">
      <form action={formAction} className="flex flex-col gap-4">
        <Field
          name="name"
          label="Nama Bisnis"
          required
          placeholder="Contoh: Kedai Kopi Sumber Rejeki"
        />
        <SelectField name="businessType" label="Jenis Bisnis" defaultValue="f&b">
          {Object.entries(BUSINESS_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <SelectField name="currency" label="Mata Uang" defaultValue="IDR">
          {CURRENCY_OPTIONS.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </SelectField>

        {state?.message ? (
          <p className={`text-[13px] ${state.success ? "text-pos" : "text-neg"}`}>
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Menyimpan..." : "Simpan Profil Bisnis"}
        </Button>
      </form>
    </div>
  );
}
