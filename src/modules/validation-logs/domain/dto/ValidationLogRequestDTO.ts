import type { LicenseValidationResult } from "@prisma/client";
import type { ValidationLogFilterGroup } from "../types/ValidationLogFilterGroup";

export interface ListValidationLogsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  group?: ValidationLogFilterGroup;
  result?: LicenseValidationResult;
  engineVersion?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportValidationLogsQueryDTO
  extends Omit<ListValidationLogsQueryDTO, "page" | "limit"> {
  format?: "csv" | "xlsx";
}
