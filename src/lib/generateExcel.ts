import ExcelJS from "exceljs";
import type { DriveFileRecord } from "@/lib/googleDrive";

export async function generateExcelBuffer(rows: DriveFileRecord[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("QR Batch Extractor");

  worksheet.columns = [
    { header: "SerialNumber", key: "serialNumber", width: 24 },
    { header: "QRCodeImage", key: "qrCodeImage", width: 60 },
    { header: "FileName", key: "fileName", width: 24 },
  ];

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rows.length + 1, column: 3 },
  };

  const headerRow = worksheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E79" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFB8C7D9" } },
      left: { style: "thin", color: { argb: "FFB8C7D9" } },
      bottom: { style: "thin", color: { argb: "FFB8C7D9" } },
      right: { style: "thin", color: { argb: "FFB8C7D9" } },
    };
  });

  rows.forEach((row, index) => {
    const worksheetRow = worksheet.addRow({
      serialNumber: row.serialNumber,
      qrCodeImage: row.qrCodeImage,
      fileName: row.fileName,
    });

    const isEvenRow = index % 2 === 0;
    const rowFill = isEvenRow ? "FFF6FAFF" : "FFFFFFFF";

    worksheetRow.eachCell((cell, columnNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E6EF" } },
        left: { style: "thin", color: { argb: "FFE0E6EF" } },
        bottom: { style: "thin", color: { argb: "FFE0E6EF" } },
        right: { style: "thin", color: { argb: "FFE0E6EF" } },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowFill },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: columnNumber === 2 ? "left" : "left",
        wrapText: columnNumber === 2,
      };
    });

    const serialCell = worksheetRow.getCell(1);
    serialCell.numFmt = "@";
    serialCell.value = row.serialNumber;

    const fileNameCell = worksheetRow.getCell(3);
    fileNameCell.numFmt = "@";
    fileNameCell.value = row.fileName;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}