import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata: Metadata = { title: "Profil Bisnis | DecideFirst" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (business) {
    redirect("/simulate");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          Profil Bisnis
        </h1>
        <p className="mt-1 text-[13px] text-sub">
          Informasi ini dipakai untuk menyesuaikan hasil simulasi dan mata uang.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
