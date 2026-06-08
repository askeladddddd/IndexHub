"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FolderInput } from "@/components/FolderInput";
import { PreviewTable } from "@/components/PreviewTable";
import { ExportButton } from "@/components/ExportButton";
import type { DriveFileRecord } from "@/lib/googleDrive";

type ApiErrorResponse = {
  error?: string;
};

export default function Home() {
  const [folderUrl, setFolderUrl] = useState("");
  const [rows, setRows] = useState<DriveFileRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  async function handleFetchFiles() {
    setError(null);
    setMessage(null);

    if (!folderUrl.trim()) {
      setError("Paste a Google Drive folder link first.");
      return;
    }

    setIsFetching(true);

    try {
      const response = await fetch("/api/drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderUrl }),
      });

      const data = (await response.json().catch(() => null)) as
        | { files?: DriveFileRecord[]; error?: string }
        | null;

      if (!response.ok) {
        const apiError = data as ApiErrorResponse | null;
        throw new Error(apiError?.error ?? "Unable to extract files from Google Drive.");
      }

      const files = data?.files ?? [];

      if (!files.length) {
        setRows([]);
        setMessage("No PNG files were found in that folder.");
        return;
      }

      setRows(files);
      localStorage.setItem("topline-extracted-rows", JSON.stringify(files));
      setMessage(`✅ Found ${files.length} files`);
    } catch (fetchError) {
      setRows([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to extract files.");
    } finally {
      setIsFetching(false);
    }
  }



  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] px-5 py-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/95 p-1 shadow-lg shadow-cyan-500/10">
            <Image
              src="https://topline.ph/wp-content/uploads/2024/06/130b2c4cb37caf3bb680faf165fbb71f1ccab1cd.png"
              alt="Topline logo"
              width={56}
              height={56}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
              Topline PH
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Topline IndexHub
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Google Drive File Extraction and Indexing System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
        </div>
      </header>

      <section className="grid gap-6">
          <FolderInput
            value={folderUrl}
            onChange={setFolderUrl}
            onSubmit={handleFetchFiles}
            loading={isFetching}
            disabled={false}
          />

        {(message || error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {error ?? message}
          </div>
        )}

        {isFetching && (
          <div className="flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] p-5 text-sm text-slate-200 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
            Extracting PNG files from Google Drive...
          </div>
        )}

        {!isFetching && rows.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">Extracted Results</h2>
                <p className="text-sm text-slate-300">
                  Showing {rows.length} records ready for export.
                </p>
              </div>
              <ExportButton disabled={!rows.length} loading={isExporting} onClick={handleExport} />
            </div>

            <PreviewTable rows={rows} />
          </div>
        )}
      </section>
    </main>
  );
}
