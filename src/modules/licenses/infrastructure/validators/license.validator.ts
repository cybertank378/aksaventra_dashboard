import type {
  CreateLicenseDTO,
  LicenseQueryDTO,
  ResetHwidDTO,
  UpdateLicenseStatusDTO,
  ValidateLicenseRequestDTO,
} from "@/modules/licenses/domain/dto/LicenseRequestDTO";

export interface LicenseValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: ValidateLicenseRequestDTO;
}

export interface GenericValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

function pickFirstString(body: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const val = body[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }
  return "";
}

export class LicenseValidator {
  public static validate(input: unknown): LicenseValidationResult {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return {
        isValid: false,
        errors: { payload: "Payload validasi tidak valid" },
      };
    }

    const body = input as Record<string, unknown>;

    const serialKey = pickFirstString(body, [
      "serial_key",
      "serialKey",
      "license_key",
      "licenseKey",
    ]);
    const hwid = pickFirstString(body, [
      "hwid",
      "hardware_id",
      "hardwareId",
      "machine_id",
      "machineId",
    ]);
    const engineVersionRaw = pickFirstString(body, ["engine_version", "engineVersion", "version"]);
    const engineVersion = engineVersionRaw.length > 0 ? engineVersionRaw : undefined;

    const publicIpRaw = pickFirstString(body, [
      "public_ip",
      "publicIp",
      "client_ip",
      "clientIp",
      "ip",
      "ip_address",
    ]);
    const public_ip = publicIpRaw.length > 0 ? publicIpRaw : undefined;

    if (!serialKey) {
      errors.serial_key = "serial_key wajib diisi";
    } else if (serialKey.length < 8) {
      errors.serial_key = "serial_key minimal 8 karakter";
    }

    if (!hwid) {
      errors.hwid = "hwid tidak boleh kosong";
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
        serial_key: serialKey,
        hwid,
        engine_version: engineVersion,
        public_ip,
      },
    };
  }

  public static validateListQuery(searchParams: URLSearchParams): LicenseQueryDTO {
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");
    const search = searchParams.get("search")?.trim() || undefined;
    const statusRaw = searchParams.get("status")?.toUpperCase();
    const bindingRaw = searchParams.get("binding")?.toUpperCase();
    const expiringSoon = searchParams.get("expiringSoon") === "true";
    const sortByRaw = searchParams.get("sortBy");
    const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

    const page = pageStr && Number(pageStr) > 0 ? Number(pageStr) : 1;
    const limit = limitStr && Number(limitStr) > 0 ? Math.min(100, Number(limitStr)) : 10;

    const status =
      statusRaw === "ACTIVE" ||
      statusRaw === "EXPIRED" ||
      statusRaw === "SUSPENDED" ||
      statusRaw === "ALL"
        ? statusRaw
        : undefined;

    const binding =
      bindingRaw === "BOUND" || bindingRaw === "UNBOUND" || bindingRaw === "ALL"
        ? bindingRaw
        : undefined;

    const sortBy =
      sortByRaw === "createdAt" ||
      sortByRaw === "expiresAt" ||
      sortByRaw === "lastVerifiedAt" ||
      sortByRaw === "clientName"
        ? sortByRaw
        : undefined;

    const sortOrder = sortOrderRaw === "asc" || sortOrderRaw === "desc" ? sortOrderRaw : "desc";

    return {
      page,
      limit,
      search,
      status,
      binding,
      expiringSoon,
      sortBy,
      sortOrder,
    };
  }

  public static validateCreate(input: unknown): GenericValidationResult<CreateLicenseDTO> {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return {
        isValid: false,
        errors: { payload: "Payload harus berupa objek JSON" },
      };
    }

    const body = input as Record<string, unknown>;
    const clientName = pickFirstString(body, ["clientName", "client_name", "name"]);
    const customSerialKey = pickFirstString(body, ["customSerialKey", "serialKey", "serial_key"]);
    const tierRaw = pickFirstString(body, ["tier"]).toUpperCase();
    const durationMonthsNum =
      typeof body.durationMonths === "number" ? body.durationMonths : undefined;
    const expiresAtStr = pickFirstString(body, ["expiresAt", "expires_at"]);
    const engineVersion = pickFirstString(body, ["engineVersion", "engine_version"]) || undefined;
    const vaultSecret = pickFirstString(body, ["vaultSecret", "vault_secret"]) || undefined;

    if (!clientName) {
      errors.clientName = "Nama klien / instansi wajib diisi";
    }

    const tier =
      tierRaw === "TRIAL" || tierRaw === "PRO" || tierRaw === "ENTERPRISE" ? tierRaw : "PRO";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: {
        clientName,
        customSerialKey: customSerialKey || undefined,
        tier,
        durationMonths: durationMonthsNum,
        expiresAt: expiresAtStr || undefined,
        engineVersion,
        vaultSecret,
      },
    };
  }

  public static validateResetHwid(input: unknown): GenericValidationResult<ResetHwidDTO> {
    if (!input || typeof input !== "object") {
      return {
        isValid: true,
        errors: {},
        data: {},
      };
    }

    const body = input as Record<string, unknown>;
    const reason = pickFirstString(body, ["reason", "keterangan", "notes"]);

    return {
      isValid: true,
      errors: {},
      data: {
        reason: reason || undefined,
      },
    };
  }

  public static validateUpdateStatus(
    input: unknown,
  ): GenericValidationResult<UpdateLicenseStatusDTO> {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return {
        isValid: false,
        errors: { payload: "Payload harus berupa objek JSON" },
      };
    }

    const body = input as Record<string, unknown>;
    const statusRaw = pickFirstString(body, ["status"]).toUpperCase();
    const expiresAtStr = pickFirstString(body, ["expiresAt", "expires_at"]);
    const reason = pickFirstString(body, ["reason", "keterangan"]);

    let status: "ACTIVE" | "SUSPENDED" | undefined;
    if (statusRaw) {
      if (statusRaw === "ACTIVE" || statusRaw === "SUSPENDED") {
        status = statusRaw;
      } else {
        errors.status = "Status hanya boleh ACTIVE atau SUSPENDED";
      }
    }

    if (!status && !expiresAtStr) {
      errors.payload = "Setidaknya satu dari status atau expiresAt harus diisi";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: {
        status,
        expiresAt: expiresAtStr || undefined,
        reason: reason || undefined,
      },
    };
  }
}
