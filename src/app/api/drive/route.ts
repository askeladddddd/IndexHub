import { NextResponse } from "next/server";
import { extractFolderId, listPngFilesInFolder } from "@/lib/googleDrive";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { folderUrl?: string } | null;
  const folderUrl = body?.folderUrl?.trim() ?? "";
  const folderId = extractFolderId(folderUrl);

  if (!folderId) {
    return NextResponse.json({ error: "Invalid Google Drive folder link" }, { status: 400 });
  }

  try {
    const files = await listPngFilesInFolder(folderId);

    if (!files.length) {
      return NextResponse.json({ error: "No PNG files were found in that folder" }, { status: 404 });
    }

    return NextResponse.json({ folderId, files });
  } catch (error: unknown) {
    console.error("Drive API Error:", error);
    return NextResponse.json({ error: "Failed to fetch files from Google Drive using API key." }, { status: 500 });
  }
}