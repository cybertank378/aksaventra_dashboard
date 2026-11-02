import type {
  LiveFeedQueryDTO,
  PatchBinaryStatusDTO,
  VerifyChecksumRequestDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import {
  LIVE_FEED_GROUPS,
  type LiveFeedGroup,
} from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

const SHA256_HEX_REGEX = /^[a-fA-F0-9]{64}$/;
const VALID_GROUPS = new Set<LiveFeedGroup>(LIVE_FEED_GROUPS);

export class EngineMonitorValidator {
  public static validateLiveFeedQuery(
    params: URLSearchParams | Record<string, string | string[] | undefined>,
  ): ValidationResult<LiveFeedQueryDTO> {
    const get = (key: string): string | undefined => {
      if (params instanceof URLSearchParams) {
        return params.get(key) || undefined;
      }
      const val = params[key];
      return Array.isArray(val) ? val[0] : val;
    };

    const pageRaw = get("page");
    const limitRaw = get("limit");
    const groupRaw = get("group")?.toUpperCase();
    const engineVersionRaw = get("engineVersion")?.trim();
    const searchRaw = get("search")?.trim();

    const page = pageRaw ? Math.max(1, Number.parseInt(pageRaw, 10) || 1) : 1;
    const limit = limitRaw ? Math.max(1, Math.min(100, Number.parseInt(limitRaw, 10) || 20)) : 20;

    let group: LiveFeedGroup = "ALL";
    if (groupRaw && VALID_GROUPS.has(groupRaw as LiveFeedGroup)) {
      group = groupRaw as LiveFeedGroup;
    }

    return {
      isValid: true,
      errors: {},
      data: {
        page,
        limit,
        group,
        engineVersion: engineVersionRaw || undefined,
        search: searchRaw || undefined,
      },
    };
  }

  public static validateVerifyChecksumPayload(
    body: unknown,
  ): ValidationResult<VerifyChecksumRequestDTO> {
    const errors: Record<string, string> = {};

    if (!body || typeof body !== "object") {
      return {
        isValid: false,
        errors: { body: "Payload request harus berupa objek JSON." },
      };
    }

    const payload = body as Record<string, unknown>;

    // Version validation
    if (!payload.version || typeof payload.version !== "string" || !payload.version.trim()) {
      errors.version = "Versi engine wajib diisi.";
    }

    // SHA-256 Hash validation
    if (
      !payload.sha256Hash ||
      typeof payload.sha256Hash !== "string" ||
      !payload.sha256Hash.trim()
    ) {
      errors.sha256Hash = "Nilai hash SHA-256 wajib diisi.";
    } else {
      const cleanHash = payload.sha256Hash.trim();
      if (!SHA256_HEX_REGEX.test(cleanHash)) {
        errors.sha256Hash = "Format hash SHA-256 harus berupa 64 karakter heksadesimal.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: {},
      data: {
        version: String(payload.version).trim(),
        sha256Hash: String(payload.sha256Hash).trim().toLowerCase(),
      },
    };
  }

  public static validatePatchBinaryStatus(
    body: unknown,
    idParam?: string,
  ): ValidationResult<PatchBinaryStatusDTO> {
    const errors: Record<string, string> = {};

    if (!body || typeof body !== "object") {
      return {
        isValid: false,
        errors: { body: "Payload request harus berupa objek JSON." },
      };
    }

    const payload = body as Record<string, unknown>;
    const targetId = idParam || (typeof payload.id === "string" ? payload.id.trim() : "");

    if (!targetId) {
      errors.id = "ID binary release wajib disertakan.";
    }

    if (typeof payload.isActive !== "boolean") {
      errors.isActive = "Field isActive wajib bernilai boolean (true/false).";
    }

    if (Object.keys(errors).length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: {},
      data: {
        id: targetId,
        isActive: payload.isActive as boolean,
        reason: typeof payload.reason === "string" ? payload.reason.trim() : undefined,
      },
    };
  }
}
