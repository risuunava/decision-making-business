"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateProfitImpact } from "@/lib/simulation";
import { scenarioSchema } from "@/lib/validation/scenarios";
import type { ScenarioInput } from "@/types";

export type SaveSimulationResult = {
  success: boolean;
  message: string;
  simulationId?: string;
};

export async function saveSimulation(
  input: ScenarioInput
): Promise<SaveSimulationResult> {
  const supabase = await createClient();

  const parsed = scenarioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Input simulasi tidak valid." };
  }

  const result = calculateProfitImpact(parsed.data);

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

  const { data: simulation, error } = await supabase
    .from("simulations")
    .insert({
      business_id: business.id,
      scenario_type: parsed.data.scenarioType,
      input_params: parsed.data,
      assumption_source: "manual",
      result,
    })
    .select("id")
    .single();

  if (error || !simulation) {
    return { success: false, message: "Gagal menyimpan simulasi." };
  }

  const { error: logError } = await supabase.from("decision_log").insert({
    simulation_id: simulation.id,
  });

  if (logError) {
    return { success: false, message: "Simulasi tersimpan, log keputusan gagal dibuat." };
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
  return { success: true, message: "Simulasi tersimpan.", simulationId: simulation.id };
}
