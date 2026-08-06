import { BookOpen } from "lucide-react";
import { BENCHMARKS, BENCHMARK_SOURCE_NOTE } from "@/lib/data/benchmarks";
import type { BusinessType } from "@/types";
import { formatNumber } from "@/lib/constants";

export function BenchmarkCard({ businessType }: { businessType: BusinessType }) {
  const benchmark = BENCHMARKS[businessType];

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <BookOpen size={18} className="text-primary" />
        <h2 className="text-[16px] font-semibold text-ink">
          Referensi Benchmark
        </h2>
      </div>
      <p className="mt-1 text-[12px] text-sub">{BENCHMARK_SOURCE_NOTE}</p>

      <dl className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <dt className="text-[12px] text-sub">Margin Kotor Tipikal</dt>
          <dd className="text-sm font-semibold text-ink">
            {formatNumber(benchmark.grossMarginRange.min)} sampai{" "}
            {formatNumber(benchmark.grossMarginRange.max)}%
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[12px] text-sub">Margin Bersih Tipikal</dt>
          <dd className="text-sm font-semibold text-ink">
            {formatNumber(benchmark.netMarginRange.min)} sampai{" "}
            {formatNumber(benchmark.netMarginRange.max)}%
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[12px] text-sub">Sensitivitas Harga</dt>
          <dd className="text-[13px] leading-6 text-ink">
            {benchmark.priceElasticityNote}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[12px] text-sub">Catatan</dt>
          <dd className="text-[13px] leading-6 text-ink">{benchmark.notes}</dd>
        </div>
      </dl>
    </div>
  );
}
