import type { ValidateLicenseRequestDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";

export interface LicenseValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: ValidateLicenseRequestDTO;
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

    const serialKey = typeof body.serial_key === "string" ? body.serial_key.trim() : "";
    const hwid = typeof body.hwid === "string" ? body.hwid.trim() : "";
    const engineVersion =
      typeof body.engine_version === "string" ? body.engine_version.trim() : undefined;

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
      },
    };
  }
}
