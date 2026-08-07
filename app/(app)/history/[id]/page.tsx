import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResultView } from "@/components/result-view";
import { buildRecommendations } from "@/lib/recommendations/decisionTree";
import { SCENARIO_FIELDS } from "@/lib/scenario-fields";
import {
  SCENARIO_LABEL,
  formatDate,
  formatMoney,
  formatNumber,
} from "@/lib/constants";
import type { FieldKind } from "@/lib/scenario-fields";

export const metadata: Metadata = { title: "Detail Simulasi | DecideFirst" };

function formatFieldValue(kind: FieldKind, value: number, currency: string): string {
  if (kind === "money") return formatMoney(value, currency);
  if (kind === "percent") return `${formatNumber(value, 1)}%`;
  return formatNumber(value);
}

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  const { data: simulation } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!simulation) {
    notFound();
  }

  const scenarioType = simulation.scenario_type as keyof typeof SCENARIO_FIELDS;
  const fields = SCENARIO_FIELDS[scenarioType];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/history"
          className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-sub transition-colors duration-150 hover:text-ink"
        >
          <ChevronLeft size={16} />
          Kembali ke Riwayat
        </Link>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          {SCENARIO_LABEL[scenarioType]}
        </h1>
        <p className="mt-1 text-[13px] text-sub">
          {formatDate(simulation.created_at)} |{" "}
          SIM#{simulation.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-ink">Asumsi Input</h2>
        <p className="mt-1 text-[13px] text-sub">
          Angka yang Anda masukkan saat menjalankan simulasi ini.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => {
            const raw = simulation.input_params[field.name as never];
            const value = typeof raw === "number" ? raw : Number(raw ?? 0);
            return (
              <div key={field.name} className="flex flex-col gap-1">
                <dt className="text-[12px] text-sub">{field.label}</dt>
                <dd className="text-sm font-semibold text-ink">
                  {formatFieldValue(field.kind, value, business.currency)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <ResultView
        result={simulation.result}
        currency={business.currency}
        recommendations={buildRecommendations(
          simulation.result,
          business.business_type,
          simulation.input_params
        )}
      />
    </div>
  );
}
