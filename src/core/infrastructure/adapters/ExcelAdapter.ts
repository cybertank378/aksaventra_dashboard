export interface ExcelExportOptions<T> {
  data: T[];
  columns: { header: string; key: keyof T }[];
  sheetName?: string;
}

export class ExcelAdapter {
  /**
   * Generates CSV / Tabular content string from dataset.
   * Can be easily upgraded to xlsx or exceljs when library is required.
   */
  public static toCsvString<T extends Record<string, unknown>>(
    options: ExcelExportOptions<T>,
  ): string {
    const headers = options.columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const rows = options.data.map((row) =>
      options.columns
        .map((col) => {
          const val = row[col.key];
          if (val === null || val === undefined) return '""';
          const str = typeof val === "object" ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    return [headers, ...rows].join("\r\n");
  }

  public static toCsvBuffer<T extends Record<string, unknown>>(
    options: ExcelExportOptions<T>,
  ): Buffer {
    const csv = ExcelAdapter.toCsvString(options);
    return Buffer.from(csv, "utf-8");
  }
}
