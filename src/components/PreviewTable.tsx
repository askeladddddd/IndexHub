"use client";

import type { DriveFileRecord } from "@/lib/googleDrive";

type PreviewTableProps = {
  rows: DriveFileRecord[];
};

export function PreviewTable({ rows }: PreviewTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
          Preview
        </h2>
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