import type { LicenseValidationResult } from "@prisma/client";
import type {
  ExportValidationLogsQueryDTO,
  ListValidationLogsQueryDTO,
} from "../../domain/dto/ValidationLogRequestDTO";
import type { ValidationLogFilterGroup } from "../../domain/types/ValidationLogFilterGroup";
import { DEFAULT_VALIDATION_LOG_PAGE_LIMIT } from "../../shared/constants/validationLogConstants";

export interface ValidationOutput<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

const VALID_GROUPS: readonly ValidationLogFilterGroup[] = [
  "ALL",
  "SUCCESS",
  "MISMATCH",
  "REJECTED",
];

const VALID_RESULTS: readonly LicenseValidationResult[] = [
  "ACTIVATED",
  "VERIFIED",
  "NOT_FOUND",
  "EXPIRED",
  "SUSPENDED",
  "HWID_MISMATCH",
  "BAD_REQUEST",
];

export class ValidationLogValidator {
  public static validateListQuery(input: unknown): ValidationOutput<ListValidationLogsQueryDTO> {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return {
        isValid: true,
        errors,
        data: {
          page: 1,
          limit: DEFAULT_VALIDATION_LOG_PAGE_LIMIT,
          group: "ALL",
        },
      };
    }

    const obj = input as Record<string, unknown>;

    // 1. Page
    let page = 1;
    if (obj.page !== undefined && obj.page !== null && obj.page !== "") {
      const parsedPage = Number(obj.page);
      if (Number.isNaN(parsedPage) || parsedPage < 1) {
        errors.page = "Parameter page harus berupa bilangan bulat positif";
      } else {
        page = Math.floor(parsedPage);
      }
    }

    // 2. Limit
    let limit = DEFAULT_VALIDATION_LOG_PAGE_LIMIT;
    if (obj.limit !== undefined && obj.limit !== null && obj.limit !== "") {
      const parsedLimit = Number(obj.limit);
      if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        errors.limit = "Parameter limit harus berupa angka antara 1 dan 100";
      } else {
        limit = Math.floor(parsedLimit);
      }
    }

    // 3. Group
    let group: ValidationLogFilterGroup | undefined = "ALL";
    if (obj.group !== undefined && obj.group !== null && obj.group !== "") {
      const g = String(obj.group).toUpperCase() as ValidationLogFilterGroup;
      if (!VALID_GROUPS.includes(g)) {
        errors.group = "Parameter group harus salah satu dari: ALL, SUCCESS, MISMATCH, REJECTED";
      } else {
        group = g;
      }
    }

    // 4. Result
    let result: LicenseValidationResult | undefined;
    if (obj.result !== undefined && obj.result !== null && obj.result !== "") {
      const r = String(obj.result).toUpperCase() as LicenseValidationResult;
      if (!VALID_RESULTS.includes(r)) {
        errors.result = `Parameter result harus salah satu dari: ${VALID_RESULTS.join(", ")}`;
      } else {
        result = r;
      }
    }

    // 5. Dates
    let startDate: string | undefined;
    if (obj.startDate && typeof obj.startDate === "string" && obj.startDate.trim() !== "") {
      const date = new Date(obj.startDate);
      if (Number.isNaN(date.getTime())) {
        errors.startDate = "Format tanggal startDate tidak valid (gunakan ISO format)";
      } else {
        startDate = obj.startDate.trim();
      }
    }

    let endDate: string | undefined;
    if (obj.endDate && typeof obj.endDate === "string" && obj.endDate.trim() !== "") {
      const date = new Date(obj.endDate);
      if (Number.isNaN(date.getTime())) {
        errors.endDate = "Format tanggal endDate tidak valid (gunakan ISO format)";
      } else {
        endDate = obj.endDate.trim();
      }
    }

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    const search =
      typeof obj.search === "string" && obj.search.trim() !== "" ? obj.search.trim() : undefined;

    const engineVersion =
      typeof obj.engineVersion === "string" && obj.engineVersion.trim() !== ""
        ? obj.engineVersion.trim()
        : undefined;

    return {
      isValid: true,
      errors: {},
      data: {
        page,
        limit,
        group,
        result,
        search,
        engineVersion,
        startDate,
        endDate,
      },
    };
  }

  public static validateExportQuery(
    input: unknown,
  ): ValidationOutput<ExportValidationLogsQueryDTO> {
    const listValidation = ValidationLogValidator.validateListQuery(input);
    if (!listValidation.isValid) {
      return { isValid: false, errors: listValidation.errors };
    }

    const obj = (input as Record<string, unknown>) || {};
    const format = obj.format === "xlsx" ? "xlsx" : "csv";

    return {
      isValid: true,
      errors: {},
      data: {
        ...listValidation.data,
        format,
      },
    };
  }

  public static validateId(id: unknown): ValidationOutput<{ id: string }> {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return {
        isValid: false,
        errors: { id: "ID log validasi wajib diisi" },
      };
    }

    return {
      isValid: true,
      errors: {},
      data: { id: id.trim() },
    };
  }

  public static validatePruneQuery(input: unknown): ValidationOutput<{ days: number }> {
    let days = 90;
    if (input && typeof input === "object") {
      const obj = input as Record<string, unknown>;
      if (obj.days !== undefined && obj.days !== null && obj.days !== "") {
        const parsed = Number(obj.days);
        if (Number.isNaN(parsed) || parsed < 7) {
          return {
            isValid: false,
            errors: { days: "Batas retensi hari minimal adalah 7 hari" },
          };
        }
        days = Math.floor(parsed);
      }
    }

    return {
      isValid: true,
      errors: {},
      data: { days },
    };
  }
}
