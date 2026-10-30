/* ============================================================
 * RELEASE VALIDATOR
 * ============================================================
 *
 * Responsibility:
 * - Native, zero-dependency validation for check-version & create-release payloads
 * ============================================================
 */

import type {
  CheckVersionRequestDTO,
  CreateReleaseRequestDTO,
} from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";
import { SemVer } from "@/modules/releases/domain/value-object/SemVer";

export class ReleaseValidator {
  public static validateCheckVersion(input: unknown): {
    isValid: boolean;
    data?: CheckVersionRequestDTO;
    errors: Record<string, string>;
  } {
    if (!input || typeof input !== "object") {
      return {
        isValid: false,
        errors: { payload: "Payload pengecekan versi tidak valid" },
      };
    }

    const body = input as Record<string, unknown>;
    const rawVersion =
      (typeof body.client_version === "string" ? body.client_version : undefined) ??
      (typeof body.clientVersion === "string" ? body.clientVersion : undefined);

    if (!rawVersion || rawVersion.trim().length === 0) {
      return {
        isValid: false,
        errors: { client_version: "client_version atau clientVersion wajib diisi" },
      };
    }

    const client_version = rawVersion.trim();
    const hwid =
      typeof body.hwid === "string" && body.hwid.trim().length > 0 ? body.hwid.trim() : undefined;
    const serial_key =
      (typeof body.serial_key === "string" ? body.serial_key : undefined) ??
      (typeof body.serialKey === "string" ? body.serialKey : undefined);
    const channel =
      typeof body.channel === "string" && body.channel.trim().length > 0
        ? body.channel.trim().toLowerCase()
        : undefined;

    return {
      isValid: true,
      data: {
        client_version,
        hwid,
        serial_key: serial_key?.trim() || undefined,
        channel,
      },
      errors: {},
    };
  }

  public static validateCreateRelease(input: unknown): {
    isValid: boolean;
    data?: CreateReleaseRequestDTO;
    errors: Record<string, string>;
  } {
    if (!input || typeof input !== "object") {
      return {
        isValid: false,
        errors: { payload: "Data rilis tidak valid" },
      };
    }

    const body = input as Record<string, unknown>;
    const errors: Record<string, string> = {};

    const version = typeof body.version === "string" ? body.version.trim() : "";
    if (!version) {
      errors.version = "Versi rilis wajib diisi";
    } else if (!SemVer.isValid(version)) {
      errors.version = "Format versi harus mengikuti SemVer (misal v2.2.2)";
    }

    let minSupportedVersion: string | null = null;
    if (
      typeof body.minSupportedVersion === "string" &&
      body.minSupportedVersion.trim().length > 0
    ) {
      const trimmed = body.minSupportedVersion.trim();
      if (!SemVer.isValid(trimmed)) {
        errors.minSupportedVersion = "Format minSupportedVersion harus mengikuti SemVer";
      } else {
        minSupportedVersion = trimmed;
      }
    }

    const rawChannel =
      typeof body.channel === "string" ? body.channel.trim().toUpperCase() : "STABLE";
    const channel: ReleaseChannelType =
      rawChannel === "BETA" || rawChannel === "NIGHTLY" ? rawChannel : "STABLE";

    const checksumSha256 =
      typeof body.checksumSha256 === "string" ? body.checksumSha256.trim() : "";
    if (!checksumSha256 || checksumSha256.length < 10) {
      errors.checksumSha256 = "Checksum SHA-256 wajib diisi";
    }

    let fileSize = BigInt(0);
    if (
      typeof body.fileSize === "number" ||
      typeof body.fileSize === "bigint" ||
      typeof body.fileSize === "string"
    ) {
      try {
        fileSize = BigInt(body.fileSize);
      } catch {
        errors.fileSize = "Ukuran berkas tidak valid";
      }
    }

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      data: {
        version,
        channel,
        minSupportedVersion,
        mandatory: Boolean(body.mandatory),
        downloadUrl: typeof body.downloadUrl === "string" ? body.downloadUrl : undefined,
        filePath: typeof body.filePath === "string" ? body.filePath : undefined,
        checksumSha256,
        fileSize,
        releaseNotes: typeof body.releaseNotes === "string" ? body.releaseNotes : undefined,
        isActive: body.isActive !== false,
      },
      errors: {},
    };
  }
}
