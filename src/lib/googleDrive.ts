import { google } from "googleapis";

export type DriveFileRecord = {
  id: string;
  serialNumber: string;
  qrCodeImage: string;
  fileName: string;
};

type GoogleDriveFile = {
  id?: string | null;
  name?: string | null;
  webViewLink?: string | null;
};

export function extractFolderId(input: string): string | null {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    return null;
  }

  if (/^[a-zA-Z0-9_-]{20,}$/.test(normalizedInput)) {
    return normalizedInput;
  }

  const parseFolderId = (value: string) => {
    const match = value.match(/\/folders\/([a-zA-Z0-9_-]+)/i);
    return match?.[1] ?? null;
  };

  try {
    const normalizedUrl = normalizedInput.startsWith("http")
      ? normalizedInput
      : `https://${normalizedInput}`;
    const url = new URL(normalizedUrl);

    return (
      parseFolderId(url.pathname) ??
      parseFolderId(url.pathname.replace(/^\/drive\/u\/\d+/, "/drive")) ??
      url.searchParams.get("id")
    );
  } catch {
    return parseFolderId(normalizedInput);
  }
}

export function stripPngExtension(fileName: string): string {
  return fileName.replace(/\.png$/i, "");
}

export function buildDriveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function normalizeDriveFiles(files: GoogleDriveFile[]): DriveFileRecord[] {
  return files
    .filter((file) => Boolean(file.id && file.name))
    .map((file) => {
      const name = file.name as string;
      const serialNumber = stripPngExtension(name);
      const fileId = file.id as string;

      return {
        id: fileId,
        serialNumber,
        fileName: serialNumber,
        qrCodeImage: file.webViewLink ?? buildDriveFileUrl(fileId),
      };
    })
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
}

export async function listPngFilesInFolder(folderId: string) {
  const drive = google.drive({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
  });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/png' and trashed = false`,
    fields: "files(id, name, webViewLink)",
    orderBy: "name",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return normalizeDriveFiles(response.data.files ?? []);
}