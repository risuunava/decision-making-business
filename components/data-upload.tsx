"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Download, FileUp } from "lucide-react";
import type { CsvTransactionRow } from "@/types";
import {
  validateCsvHeaders,
  validateCsvRows,
} from "@/lib/validation/transactions";
import { saveTransactions } from "@/lib/actions/data";
import type { DataActionResult } from "@/lib/actions/data";
import { Button, buttonClasses } from "@/components/button";
import { formatNumber } from "@/lib/constants";

const TEMPLATE_HEADER = [
  "date",
  "item_name",
  "quantity",
  "unit_price",
  "cost_per_unit",
];
const TEMPLATE_SAMPLE = [
  "2026-07-01",
  "Kopi Tubruk",
  "10",
  "15000",
  "7000",
];

export function DataUpload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsvTransactionRow[] | null>(null);
  const [errorRows, setErrorRows] = useState<
    { rowNumber: number; message: string }[]
  >([]);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [banner, setBanner] = useState<DataActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function downloadTemplate() {
    const content = [TEMPLATE_HEADER.join(","), TEMPLATE_SAMPLE.join(",")].join(
      "\n"
    );
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-transaksi.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File) {
    setFileName(file.name);
    setBanner(null);
    setRows(null);
    setErrorRows([]);
    setMissingHeaders([]);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const missing = validateCsvHeaders(result.meta.fields ?? []);
        if (missing.length > 0) {
          setMissingHeaders(missing);
          return;
        }
        const { valid, errors } = validateCsvRows(result.data);
        setRows(valid);
        setErrorRows(errors);
      },
    });
  }

  function confirmSave() {
    if (!rows || rows.length === 0) return;
    startTransition(async () => {
      const result = await saveTransactions(rows);
      setBanner(result);
      if (result.success) {
        setRows(null);
        setErrorRows([]);
        setMissingHeaders([]);
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-line bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-ink">
            Unggah Data Transaksi
          </h2>
          <p className="mt-1 text-[13px] text-sub">
            Format CSV: date, item_name, quantity, unit_price, cost_per_unit.
            Tanggal memakai YYYY-MM-DD atau DD/MM/YYYY.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className={buttonClasses("secondary")}
        >
          <Download size={16} />
          Unduh Template
        </button>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-hover p-8 transition-colors duration-150 hover:border-primary">
        <FileUp size={20} className="text-sub" />
        <span className="text-sm text-sub">
          Pilih file CSV untuk diparsing dan dipratinjau
        </span>
        <span className="text-[12px] text-muted">
          Maksimal 5000 baris. Data lama akan diganti oleh unggahan baru.
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {fileName ? (
        <p className="mt-3 text-[13px] text-sub">
          File terpilih: <span className="font-semibold text-ink">{fileName}</span>
        </p>
      ) : null}

      {missingHeaders.length > 0 ? (
        <div className="mt-4 rounded-lg border border-line p-4">
          <p className="text-[13px] font-semibold text-neg">
            Kolom wajib tidak ditemukan
          </p>
          <p className="mt-1 text-[13px] text-sub">
            Header berikut hilang dari file Anda:{" "}
            <span className="font-semibold text-ink">
              {missingHeaders.join(", ")}
            </span>
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Periksa baris pertama file dan pastikan nama kolom sama persis
            dengan template.
          </p>
        </div>
      ) : null}

      {rows && rows.length > 0 ? (
        <div className="mt-4">
          <p className="text-[13px] text-ink">
            <span className="font-semibold">{formatNumber(rows.length)} baris</span>{" "}
            valid siap disimpan
          </p>
          {errorRows.length > 0 ? (
            <p className="mt-1 text-[12px] text-warn">
              {formatNumber(errorRows.length)} baris dilewati karena tidak valid.
            </p>
          ) : null}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[12px] uppercase text-muted">
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4 text-right">Qty</th>
                  <th className="py-2 pr-4 text-right">Harga/Unit</th>
                  <th className="py-2 text-right">Cost/Unit</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((row, index) => (
                  <tr key={index} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-4 text-sub">{row.date}</td>
                    <td className="py-2 pr-4 text-ink">{row.item_name}</td>
                    <td className="py-2 pr-4 text-right text-ink">
                      {formatNumber(row.quantity)}
                    </td>
                    <td className="py-2 pr-4 text-right text-ink">
                      {formatNumber(row.unit_price)}
                    </td>
                    <td className="py-2 text-right text-ink">
                      {formatNumber(row.cost_per_unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 ? (
              <p className="mt-2 text-[12px] text-muted">
                Menampilkan 50 baris pertama dari {formatNumber(rows.length)}.
              </p>
            ) : null}
          </div>
          <Button onClick={confirmSave} disabled={isPending} className="mt-4">
            {isPending
              ? "Menyimpan..."
              : `Simpan ${formatNumber(rows.length)} Baris`}
          </Button>
        </div>
      ) : null}

      {errorRows.length > 0 && rows === null ? (
        <div className="mt-4 rounded-lg border border-line p-4">
          <p className="text-[13px] font-semibold text-neg">
            Tidak ada baris valid
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {errorRows.slice(0, 10).map((error) => (
              <li key={error.rowNumber} className="text-[12px] text-sub">
                Baris {error.rowNumber}: {error.message}
              </li>
            ))}
          </ul>
          {errorRows.length > 10 ? (
            <p className="mt-1 text-[12px] text-muted">
              dan {formatNumber(errorRows.length - 10)} baris lainnya.
            </p>
          ) : null}
        </div>
      ) : null}

      {banner?.message ? (
        <p
          className={`mt-4 text-[13px] ${
            banner.success ? "text-pos" : "text-neg"
          }`}
        >
          {banner.message}
        </p>
      ) : null}
    </div>
  );
}
