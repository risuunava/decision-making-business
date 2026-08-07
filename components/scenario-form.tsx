"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { BadgePercent, Package, Tag, Users } from "lucide-react";
import type {
  BusinessType,
  ScenarioInput,
  ScenarioType,
  SimulationResult,
} from "@/types";
import { calculateProfitImpact } from "@/lib/simulation/engine";
import { scenarioSchema } from "@/lib/validation/scenarios";
import { saveSimulation } from "@/lib/actions/simulation";
import { SCENARIO_FIELDS, SCENARIO_DESCRIPTION } from "@/lib/scenario-fields";
import { SCENARIO_LABEL } from "@/lib/constants";
import { parseNaturalInput } from "@/lib/recommendations/naturalInput";
import { buildRecommendations } from "@/lib/recommendations/decisionTree";
import type { ElasticityEstimate } from "@/lib/statistics/elasticity";
import { Field } from "@/components/field";
import { Button } from "@/components/button";
import { ResultView } from "@/components/result-view";
import { AdvancedAnalysis } from "@/components/advanced-analysis";

const SCENARIO_TYPES: { type: ScenarioType; icon: typeof Tag }[] = [
  { type: "pricing", icon: Tag },
  { type: "discount", icon: BadgePercent },
  { type: "staffing", icon: Users },
  { type: "inventory", icon: Package },
];

function emptyValues(type: ScenarioType): Record<string, string> {
  return Object.fromEntries(
    SCENARIO_FIELDS[type].map((field) => [field.name, ""])
  );
}

export function ScenarioForm({
  currency,
  businessType,
  analysis,
}: {
  currency: string;
  businessType: BusinessType;
  analysis: { elasticity: ElasticityEstimate | null; volumeChanges: number[] };
}) {
  const [scenarioType, setScenarioType] = useState<ScenarioType>("pricing");
  const [values, setValues] = useState<Record<string, string>>(() =>
    emptyValues("pricing")
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [input, setInput] = useState<ScenarioInput | null>(null);
  const [query, setQuery] = useState("");
  const [queryHint, setQueryHint] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    { success: boolean; message: string } | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);

  const fields = SCENARIO_FIELDS[scenarioType];

  function switchType(type: ScenarioType) {
    setScenarioType(type);
    setValues(emptyValues(type));
    setErrors({});
    setBanner(null);
    setResult(null);
    setInput(null);
    setSaveState(null);
  }

  function applyQuery(event: FormEvent) {
    event.preventDefault();
    const parsed = parseNaturalInput(query);
    if (!parsed) {
      setQueryHint("Pola tidak dikenali. Isi langsung di form di bawah ini.");
      return;
    }
    setQueryHint(null);
    switchType(parsed.scenarioType);
    const prefilled: Record<string, string> = {};
    for (const [name, value] of Object.entries(parsed.values)) {
      prefilled[name] = String(value);
    }
    setValues({ ...emptyValues(parsed.scenarioType), ...prefilled });
  }

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function runSimulation(formData: FormData) {
    const emptyField = fields.find(
      (field) => String(formData.get(field.name) ?? "").trim() === ""
    );
    if (emptyField) {
      setErrors({ [emptyField.name]: "Field ini wajib diisi." });
      return;
    }

    const raw: Record<string, unknown> = { scenarioType };
    for (const field of fields) {
      raw[field.name] = Number(formData.get(field.name));
    }

    const parsed = scenarioSchema.safeParse(raw);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] ?? "");
        if (path && !nextErrors[path]) {
          nextErrors[path] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setBanner(null);
    const input = parsed.data as ScenarioInput;
    setInput(input);
    setResult(calculateProfitImpact(input));

    startTransition(async () => {
      const saved = await saveSimulation(input);
      setSaveState(saved);
      if (!saved.success) {
        setBanner("Hasil tetap ditampilkan, tetapi belum tersimpan.");
      }
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-line bg-card p-6 shadow-card">
        <h2 className="text-[20px] font-semibold text-ink">Buat Simulasi Baru</h2>
        <p className="mt-1 text-[13px] text-sub">{SCENARIO_DESCRIPTION[scenarioType]}</p>

        <form onSubmit={applyQuery} className="mt-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[280px] flex-1">
              <Field
                name="quick-input"
                label="Ketik Cepat"
                placeholder='contoh: "diskon 10%" atau "harga 100.000 jadi 120.000"'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Terapkan
            </Button>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Pola yang dikenali: diskon X%, naikkan harga, harga A jadi B, tambah
            pegawai, stok turun X%.
          </p>
          {queryHint ? (
            <p className="mt-1 text-[12px] text-warn">{queryHint}</p>
          ) : null}
        </form>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {SCENARIO_TYPES.map(({ type, icon: Icon }) => {
            const isActive = scenarioType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => switchType(type)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150 ${
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-sub hover:border-line-hover hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {SCENARIO_LABEL[type]}
              </button>
            );
          })}
        </div>

        <form action={runSimulation} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <Field
                key={field.name}
                name={field.name}
                label={field.label}
                hint={field.hint}
                error={errors[field.name]}
                type="number"
                inputMode="decimal"
                step="any"
                min={field.min ?? 0}
                value={values[field.name]}
                onChange={(event) => setValue(field.name, event.target.value)}
              />
            ))}
          </div>

          {banner ? (
            <p className="mt-4 text-[13px] text-warn">{banner}</p>
          ) : null}
          {saveState?.success ? (
            <p className="mt-4 text-[13px] text-pos">{saveState.message}</p>
          ) : null}

          <Button type="submit" disabled={isPending} className="mt-6">
            {isPending ? "Menyimpan..." : "Jalankan Simulasi"}
          </Button>
        </form>
      </div>

      {result && input ? (
        <div ref={resultRef} className="flex scroll-mt-6 flex-col gap-6">
          <ResultView
            result={result}
            currency={currency}
            recommendations={buildRecommendations(result, businessType, input)}
          />
          {input.scenarioType === "pricing" ? (
            <AdvancedAnalysis
              elasticity={analysis.elasticity}
              volumeChanges={analysis.volumeChanges}
              currency={currency}
              input={input}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
