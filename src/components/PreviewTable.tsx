"use client";

import { useState } from "react";
import type { DriveFileRecord } from "@/lib/googleDrive";

type PreviewTableProps = {
  rows: DriveFileRecord[];
};

export function PreviewTable({ rows }: PreviewTableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const header = ["SerialNumber", "QRCodeImage", "FileName"].join("\t");
    const formatValue = (val: string) => {
      // Prepend a single quote to numeric strings starting with zero to prevent spreadsheets from stripping them
      return /^0\d+$/.test(val) ? `'${val}` : val;
    };
    const rowsText = rows
      .map((row) => `${formatValue(row.serialNumber)}\t${row.qrCodeImage}\t${formatValue(row.fileName)}`)
      .join("\n");
    const fullText = `${header}\n${rowsText}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy table", err);
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] shadow-2xl shadow-slate-950/25">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
          Preview
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy Table
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-950/45 text-left text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium sm:px-5">SerialNumber</th>
              <th className="px-4 py-3 font-medium sm:px-5">QRCodeImage</th>
              <th className="px-4 py-3 font-medium sm:px-5">FileName</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <tr
                key={`${row.id}-${row.fileName}`}
                className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-transparent"}
              >
                <td className="px-4 py-3 font-mono text-slate-100 sm:px-5">{row.serialNumber}</td>
                <td className="px-4 py-3 text-cyan-100 sm:px-5">
                  <a
                    href={row.qrCodeImage}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline decoration-cyan-400/50 underline-offset-4 hover:text-cyan-50"
                  >
                    {row.qrCodeImage}
                  </a>
                </td>
                <td className="px-4 py-3 font-mono text-slate-100 sm:px-5">{row.fileName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}