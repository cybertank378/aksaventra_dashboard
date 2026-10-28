import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ValidateLicenseRequestDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { ValidateLicenseSuccessResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

export interface LicenseValidationError {
  statusCode: 401 | 403 | 404;
  message: string;
}

export class ValidateLicenseUseCase
  implements
    BaseUseCase<
      ValidateLicenseRequestDTO,
      Result<ValidateLicenseSuccessResponseDTO, LicenseValidationError>
    >
{
  constructor(private readonly licenseRepo: LicenseRepositoryInterface) {}

  public async execute(
    dto: ValidateLicenseRequestDTO,
  ): Promise<Result<ValidateLicenseSuccessResponseDTO, LicenseValidationError>> {
    const serialKey = dto.serial_key?.trim();
    const hwid = dto.hwid?.trim();

    if (!serialKey || !hwid) {
      return Result.fail({
        statusCode: 401,
        message: "Serial key dan Hardware ID wajib diisi.",
      });
    }

    const license = await this.licenseRepo.findBySerialKey(serialKey);

    // Kasus 4: Tidak ditemukan di database
    if (!license) {
      return Result.fail({
        statusCode: 404,
        message:
          "Lisensi Tidak Ditemukan atau Telah Kadaluarsa. Silakan peroleh lisensi resmi di https://aksaventra.ai.id",
      });
    }

    // Kasus 4: Status ditangguhkan atau telah kadaluarsa
    if (!license.isActive()) {
      return Result.fail({
        statusCode: 401,
        message:
          "Lisensi tidak aktif, ditangguhkan, atau telah kadaluarsa. Silakan periksa kembali di https://aksaventra.ai.id",
      });
    }

    // Kasus 1: Valid & HWID Kosong (Aktivasi Baru)
    if (!license.hasHardwareBinding()) {
      license.bindHardwareId(hwid);
      if (dto.engine_version) {
        license.markVerified(dto.engine_version);
      }
      await this.licenseRepo.update(license);

      return Result.ok(
        license.toResponseContract("Lisensi berhasil diaktivasi dan dikunci pada perangkat ini."),
      );
    }

    // Kasus 2: Valid & HWID Cocok (Device Terdaftar)
    if (license.matchesHardwareId(hwid)) {
      license.markVerified(dto.engine_version);
      await this.licenseRepo.update(license);

      return Result.ok(
        license.toResponseContract("Lisensi aktif dan terverifikasi untuk perangkat ini."),
      );
    }

    // Kasus 3: Valid tapi HWID Berbeda (Hardware Mismatch)
    return Result.fail({
      statusCode: 403,
      message:
        "Hardware Mismatch: Serial key ini telah terkunci pada perangkat keras (HWID) lain. Silakan hubungi administrator di https://aksaventra.ai.id untuk mereset perangkat terdaftar.",
    });
  }
}
