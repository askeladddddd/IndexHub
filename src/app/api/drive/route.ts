import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { extractFolderId, listPngFilesInFolder } from "@/lib/googleDrive";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || (session.accessTokenExpires && Date.now() >= session.accessTokenExpires)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { folderUrl?: string } | null;
  const folderUrl = body?.folderUrl?.trim() ?? "";
  const folderId = extractFolderId(folderUrl);

  if (!folderId) {
    return NextResponse.json({ error: "Invalid Google Drive folder link" }, { status: 400 });
  }

  const files = await listPngFilesInFolder(session.accessToken, folderId);

  if (!files.length) {
    return NextResponse.json({ error: "No PNG files were found in that folder" }, { status: 404 });
  }

  return NextResponse.json({ folderId, files });
}