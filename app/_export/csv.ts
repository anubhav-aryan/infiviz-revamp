/**
 * CSV export for the tables on screen.
 *
 * The payload crosses the server/client boundary as a plain matrix of cells,
 * not as column accessor functions — functions aren't serializable, and a
 * matrix keeps "what you exported" and "what you were looking at" the same
 * array the table rendered.
 */

export type CsvTable = {
  headers: string[];
  rows: (string | number)[][];
};

function escapeCell(input: string | number): string {
  const s = String(input);
  // Quote anything that would otherwise break the row apart, and double any
  // embedded quotes, per RFC 4180.
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(table: CsvTable): string {
  const lines = [table.headers.map(escapeCell).join(",")];
  for (const row of table.rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // Excel reads a UTF-8 file as the system codepage unless it sees a BOM, which
  // turns Nguyễn and Bình Thạnh into mojibake. The BOM is the whole fix.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
