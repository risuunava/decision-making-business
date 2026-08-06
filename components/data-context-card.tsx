import { BarChart3 } from "lucide-react";
import { formatMoney, formatNumber } from "@/lib/constants";

export function DataContextCard({
  monthlyRevenue,
  averageMonthlyVolume,
  lastMonth,
  currency,
}: {
  monthlyRevenue: number | null;
  averageMonthlyVolume: number | null;
  lastMonth: string | null;
  currency: string;
}) {
  const hasData = monthlyRevenue !== null;

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" />
        <h2 className="text-[16px] font-semibold text-ink">
          Konteks Data Bisnis Anda
        </h2>
      </div>
      {hasData ? (
        <>
          <p className="mt-1 text-[12px] text-sub">
            Informasi dari data transaksi Anda, bukan asumsi otomatis. Gunakan
            sebagai referensi saat mengisi asumsi.
          </p>
          <dl className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <dt className="text-[12px] text-sub">
                Rata-rata Omzet Bulanan
              </dt>
              <dd className="text-sm font-semibold text-ink">
                {formatMoney(monthlyRevenue, currency)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[12px] text-sub">
                Rata-rata Volume Penjualan Bulanan
              </dt>
              <dd className="text-sm font-semibold text-ink">
                {averageMonthlyVolume === null
                  ? "Belum cukup data"
                  : `${formatNumber(averageMonthlyVolume)} unit`}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[12px] text-sub">Bulan Data Terakhir</dt>
              <dd className="text-sm font-semibold text-ink">
                {lastMonth ?? "-"}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-sub">
          Belum ada data transaksi. Unggah CSV di halaman Data Bisnis untuk
          melihat konteks omzet dan volume di sini.
        </p>
      )}
    </div>
  );
}
