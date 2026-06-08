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
  } catch (error: any) {
    console.error("Drive API Error:", error);
    
    let errorMessage = "Failed to fetch files from Google Drive.";
    if (error?.code === 404) {
      errorMessage = "Google Drive folder not found. Please check the link.";
    } else if (error?.code === 403) {
      errorMessage = "Access denied. Make sure the folder is shared with 'Anyone with the link can view'.";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: error?.code || 500 });
  }
}