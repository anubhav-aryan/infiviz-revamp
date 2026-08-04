"use client";

import { Icon } from "@/app/_components/icon";
import { type CsvTable, downloadCsv, toCsv } from "./csv";

type ExportButtonProps = {
  /** Serialized from the same array the table maps over. */
  table: CsvTable;
  /** Without an extension. Derive it from the period, never from a clock. */
  filename: string;
  label?: string;
  className: string;
};

export function ExportButton({
  table,
  filename,
  label = "Export CSV",
  className,
}: ExportButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => downloadCsv(`${filename}.csv`, toCsv(table))}
      disabled={table.rows.length === 0}
    >
      <Icon name="download" />
      {label}
    </button>
  );
}
