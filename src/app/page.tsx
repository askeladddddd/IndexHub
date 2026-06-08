"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FileSpreadsheet, FolderOpen, Loader2, AlertCircle, CheckCircle2, Download, Search, Copy, ArrowUp, ArrowDown, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { OnboardingTour } from "@/components/OnboardingTour";
import type { DriveFileRecord } from "@/lib/googleDrive";

type ApiErrorResponse = {
  error?: string;
};

export default function Home() {
  const [folderUrl, setFolderUrl] = useState("");
  const [files, setFiles] = useState<DriveFileRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [query, setQuery] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFileName, setExportFileName] = useState("topline-extracted-data");

  type SortField = 'serialNumber' | 'fileName';
  type SortOrder = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('serialNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filtered = useMemo(() => {
    let result = files?.filter(f =>
      f.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
      f.fileName.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [files, query, sortField, sortOrder]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  async function handleFetchFiles(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.preventDefault();
    setError(null);
    setFiles(null);

    if (!folderUrl.trim()) {
      setError("Paste a Google Drive folder link first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl }),
      });

      const data = (await response.json().catch(() => null)) as
        | { files?: DriveFileRecord[]; error?: string }
        | null;

      if (!response.ok) {
        const apiError = data as ApiErrorResponse | null;
        throw new Error(apiError?.error ?? "Unable to extract files from Google Drive.");
      }

      const extractedFiles = data?.files ?? [];

      if (!extractedFiles.length) {
        setError("No PNG files were found in that folder.");
        return;
      }

      setFiles(extractedFiles);
      localStorage.setItem("topline-extracted-rows", JSON.stringify(extractedFiles));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to extract files.");
    } finally {
      setLoading(false);
    }
  }

  function handleExportClick() {
    if (!filtered.length) return;
    setExportFileName("topline-extracted-data");
    setExportModalOpen(true);
  }

  async function confirmExport(e: React.FormEvent) {
    e.preventDefault();
    setExportModalOpen(false);

    const safeName = exportFileName.trim() || "topline-extracted-data";
    const finalFileName = safeName.toLowerCase().endsWith(".xlsx") ? safeName : `${safeName}.xlsx`;

    setError(null);
    setIsExporting(true);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: filtered }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        throw new Error(data?.error ?? "Unable to generate the Excel file.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = finalFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success("Excel file downloaded successfully.");
    } catch (exportError) {
      toast.error(exportError instanceof Error ? exportError.message : "Unable to export the Excel file.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleCopyTable() {
    if (!filtered.length) return;
    const header = "SERIAL NUMBER\tFILE NAME\n";
    const rowsText = filtered.map((row) => `${row.serialNumber}\t${row.fileName}`).join("\n");
    navigator.clipboard.writeText(header + rowsText).then(() => {
      toast.success("Table copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy table");
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef7fc]">
      <OnboardingTour />
      <Toaster />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 space-y-6 sm:px-6 lg:px-8">
        {/* Header Card */}
        <Card id="tour-header" className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white border shadow-sm p-1">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Light Fuels Suki Card
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                IndexHub
              </h1>
              <p className="text-sm text-muted-foreground">
                Google Drive File Extraction and Indexing System
              </p>
            </div>
          </div>
        </Card>

        {/* Extract Form Card */}
        <Card className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <form onSubmit={handleFetchFiles} className="space-y-3">
            <label htmlFor="folderUrl" className="text-sm font-medium">
              Google Drive folder link
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="folderUrl"
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  className="pl-9 pr-10"
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
                {folderUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFolderUrl("");
                      setFiles(null);
                      setError(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button id="tour-extract-btn" type="button" onClick={handleFetchFiles} disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Extracting..." : "Extract Files"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports standard Drive folder URLs, shared links, and <code>/drive/u/0/folders/</code> URLs.
            </p>
          </form>
        </Card>

        {/* Status Banner */}
        {loading && (
          <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Extracting files...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {!loading && !error && files && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Found {files.length} files
          </div>
        )}

        {/* Results */}
        {files && (
          <>
            <Card className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Extracted Results</h2>
                <p className="text-sm text-muted-foreground">
                  Showing {filtered.length} of {files.length} records ready for export.
                </p>
              </div>
              <Button onClick={handleExportClick} disabled={!filtered.length || isExporting} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export to Excel
              </Button>
            </Card>

            <Card className="rounded-xl border bg-card shadow-sm">
              <div className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search serial or filename..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyTable} className="h-9">
                    <Copy className="mr-2 h-4 w-4" /> Copy Table
                  </Button>
                </div>
              </div>
              <div className="max-h-[560px] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                      <th
                        className="px-6 py-3 font-medium cursor-pointer hover:text-foreground select-none transition-colors"
                        onClick={() => toggleSort('serialNumber')}
                      >
                        <div className="flex items-center">
                          Serial Number
                          {sortField === 'serialNumber' ? (sortOrder === 'asc' ? <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-foreground" /> : <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-foreground" />) : <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />}
                        </div>
                      </th>
                      <th className="px-6 py-3 font-medium">QR Code Image</th>
                      <th
                        className="px-6 py-3 font-medium cursor-pointer hover:text-foreground select-none transition-colors"
                        onClick={() => toggleSort('fileName')}
                      >
                        <div className="flex items-center">
                          File Name
                          {sortField === 'fileName' ? (sortOrder === 'asc' ? <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-foreground" /> : <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-foreground" />) : <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-t">
                    {filtered.length > 0 ? (
                      filtered.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/40">
                          <td className="w-44 px-6 py-3 font-mono">{row.serialNumber}</td>
                          <td className="px-6 py-3">
                            <a
                              href={row.qrCodeImage}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-primary hover:underline block max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl"
                            >
                              {row.qrCodeImage}
                            </a>
                          </td>
                          <td className="w-44 px-6 py-3 font-mono text-muted-foreground">{row.fileName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                          No results match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

      </main>

      {/* Footer with Wave */}
      <footer className="mt-auto w-full flex flex-col">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="block w-full h-[100px] sm:h-[150px] md:h-[200px]">
          <path fill="#0082c8" d="M0,130 C400,20 900,220 1440,0 L1440,300 L0,300 Z" />
          <path fill="#ffffff" d="M0,190 C450,80 850,260 1440,0 L1440,300 L0,300 Z" />
          <path fill="#ffb700" d="M0,220 C500,130 800,290 1440,0 L1440,300 L0,300 Z" />
        </svg>
        <div className="bg-[#ffb700] pb-6 text-center text-sm font-semibold text-slate-900/90 sm:pb-8">
          IndexHub · Built for fast Drive-to-Excel indexing
        </div>
      </footer>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 p-6 shadow-xl border bg-card">
            <h3 className="mb-4 text-lg font-semibold tracking-tight">Export to Excel</h3>
            <form onSubmit={confirmExport}>
              <div className="mb-6 space-y-2">
                <label htmlFor="fileName" className="text-sm font-medium">
                  File Name
                </label>
                <Input
                  id="fileName"
                  autoFocus
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  placeholder="topline-extracted-data"
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setExportModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Export
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
