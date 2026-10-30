import type { ValidateLicenseRequestDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";

export interface LicenseValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: ValidateLicenseRequestDTO;
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
}
