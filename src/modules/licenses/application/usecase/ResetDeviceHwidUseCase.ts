import { Result } from "@/core/domain/Result";
import type { UserRole } from "@/libs/enums";
import type { ResetHwidDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { LicenseAdminItemDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";

export interface ResetHwidParams extends ResetHwidDTO {
  id: string;
}

export class ResetDeviceHwidUseCase {
  constructor(private readonly repo: LicenseRepositoryInterface) {}

  public async execute(
    params: ResetHwidParams,
    userId?: string,
    ipAddress?: string,
    role?: UserRole,
  ): Promise<Result<LicenseAdminItemDTO, Error>> {
    try {
      if (!params.id || params.id.trim().length === 0) {
        return Result.fail(new Error("ID lisensi wajib diisi"));
      }

      const license = await this.repo.findById(params.id.trim());
      if (!license) {
        return Result.fail(new Error(`Lisensi dengan ID "${params.id}" tidak ditemukan`));
      }

      const previousHwid = license.hwid ?? "BELUM_TERIKAT";
      license.resetHwid();

      await this.repo.update(license, {
        userId: userId ?? null,
        action: "LICENSE_HWID_RESET",
        target: license.id,
        details: JSON.stringify({
          clientName: license.clientName,
          serialKey: LicenseMapper.maskSerialKey(license.serialKey),
          previousHwid,
          reason: params.reason?.trim() || "Manual reset ikatan perangkat",
        }),
        ipAddress: ipAddress ?? null,
      });

      const adminDTO = LicenseMapper.toAdminDTO(license, role);
      return Result.ok(adminDTO);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mereset ikatan perangkat HWID";
      return Result.fail(new Error(message));
    }
  }
}
