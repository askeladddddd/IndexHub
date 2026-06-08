import { NextResponse } from "next/server";
import { generateExcelBuffer } from "@/lib/generateExcel";
import type { DriveFileRecord } from "@/lib/googleDrive";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestBody = (await request.json().catch(() => null)) as { rows?: DriveFileRecord[] } | null;
  const rows = requestBody?.rows ?? [];

  if (!rows.length) {
    return NextResponse.json({ error: "No rows were provided for export" }, { status: 400 });
  }

  const buffer = await generateExcelBuffer(rows);
  const responseBody = Uint8Array.from(buffer).buffer;

  return new NextResponse(responseBody, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="topline-ph-qr-batch-extractor.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}