import { Result } from "@/core/domain/Result";
import type { UserRole } from "@/libs/enums";
import type { UpdateLicenseStatusDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { LicenseAdminItemDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";

export class UpdateLicenseStatusUseCase {
  constructor(private readonly repo: LicenseRepositoryInterface) {}

  public async execute(
    id: string,
    dto: UpdateLicenseStatusDTO,
    userId?: string,
    ipAddress?: string,
    role?: UserRole,
  ): Promise<Result<LicenseAdminItemDTO, Error>> {
    try {
      if (!id || id.trim().length === 0) {
        return Result.fail(new Error("ID lisensi wajib diisi"));
      }

      const license = await this.repo.findById(id.trim());
      if (!license) {
        return Result.fail(new Error(`Lisensi dengan ID "${id}" tidak ditemukan`));
      }

      const previousStatus = license.status;

      if (dto.status === "SUSPENDED") {
        license.suspend();
      } else if (dto.status === "ACTIVE") {
        license.activate();
      }

      if (dto.expiresAt) {
        const newExpiry = new Date(dto.expiresAt);
        if (!Number.isNaN(newExpiry.getTime())) {
          license.extendExpiration(newExpiry);
        }
      }

      await this.repo.update(license, {
        userId: userId ?? null,
        action: "LICENSE_STATUS_UPDATED",
        target: license.id,
        details: JSON.stringify({
          clientName: license.clientName,
          serialKey: LicenseMapper.maskSerialKey(license.serialKey),
          previousStatus,
          newStatus: license.status,
          expiresAt: license.expiresAt?.toISOString() ?? null,
          reason: dto.reason?.trim() || "Pembaruan status lisensi",
        }),
        ipAddress: ipAddress ?? null,
      });

      const adminDTO = LicenseMapper.toAdminDTO(license, role);
      return Result.ok(adminDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui status lisensi";
      return Result.fail(new Error(message));
    }
  }
}
