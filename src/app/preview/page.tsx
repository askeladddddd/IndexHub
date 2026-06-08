"use client";

import { useEffect, useState } from "react";
import { PreviewTable } from "@/components/PreviewTable";
import { ExportButton } from "@/components/ExportButton";
import type { DriveFileRecord } from "@/lib/googleDrive";

type ApiErrorResponse = {
  error?: string;
};

export default function PreviewPage() {
  const [rows, setRows] = useState<DriveFileRecord[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("topline-extracted-rows");
    if (data) {
      try {
        setRows(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse extracted rows");
      }
    }
  }, []);

  async function handleExport() {
    if (!rows.length) {
      return;
    }

    setError(null);
    setIsExporting(true);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        throw new Error(data?.error ?? "Unable to generate the Excel file.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "topline-ph-qr-batch-extractor.xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to export the Excel file.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Extracted Results</h1>
          <p className="text-sm text-slate-300">
            {rows.length > 0 ? `Showing ${rows.length} records ready for export.` : "No records found in session."}
          </p>
        </div>
        {rows.length > 0 && (
          <ExportButton disabled={!rows.length} loading={isExporting} onClick={handleExport} />
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {rows.length > 0 ? (
        <PreviewTable rows={rows} />
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] p-8 text-center text-slate-300 shadow-2xl backdrop-blur-xl">
          <p>No extracted data available.</p>
          <p className="mt-2 text-sm text-slate-400">Please go back to the main page and extract a folder first.</p>
        </div>
      )}
    </main>
  );
}
