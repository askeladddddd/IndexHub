"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FolderInput } from "@/components/FolderInput";
import type { DriveFileRecord } from "@/lib/googleDrive";

type ApiErrorResponse = {
  error?: string;
};

export default function Home() {
  const { status, data: session } = useSession();
  const [folderUrl, setFolderUrl] = useState("");
  const [rows, setRows] = useState<DriveFileRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const isSignedIn = status === "authenticated";
  function handleSignOut() {
    signOut();
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
              QR Batch Extractor
            </h1>
            <p className="text-sm text-slate-300">
              Corporate-style Drive batch export with zero-safe Excel output.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">Session</p>
            <p className="text-sm font-medium text-white">
              {isSignedIn
                ? session?.user?.email ?? session?.user?.name ?? "Signed in"
                : "Not signed in"}
            </p>
          </div>
          {isSignedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/20"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/20"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-[color:var(--surface)] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <div className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-100">
            Batch Export Workspace
          </div>
          <div className="mt-5 space-y-4">
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Extract PNG QR batches from Drive and export a text-safe workbook.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Paste a Google Drive folder link, preview all PNG files, and download a formatted.
            </p>
          </div>

        </div>
      </section>

      <section className="grid gap-6">
        {isSignedIn ? (
          <FolderInput
            value={folderUrl}
            onChange={setFolderUrl}
            onSubmit={handleFetchFiles}
            loading={isFetching}
            disabled={!isSignedIn}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] p-6 text-sm text-slate-200 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
            Sign in with Google to allow Drive folder access.
          </div>
        )}

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
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-100 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">✅ Found {rows.length} files</p>
                <p className="text-sm text-emerald-100/80">
                  Data extracted successfully. Click below to view results and export.
                </p>
              </div>
              <a
                href="/preview"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                View Results
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
