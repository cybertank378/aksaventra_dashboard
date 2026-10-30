import { Result } from "@/core/domain/Result";
import type { UserRole } from "@/libs/enums";
import type { LicenseDetailResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";

export class GetLicenseDetailUseCase {
  constructor(private readonly repo: LicenseRepositoryInterface) {}

  public async execute(
    id: string,
    role?: UserRole,
  ): Promise<Result<LicenseDetailResponseDTO, Error>> {
    try {
      if (!id || id.trim().length === 0) {
        return Result.fail(new Error("ID lisensi wajib diisi"));
      }

      const result = await this.repo.findByIdWithRecentLogs(id.trim(), 10);
      if (!result) {
        return Result.fail(new Error(`Lisensi dengan ID "${id}" tidak ditemukan`));
      }

      const now = new Date();
      const detailDTO = LicenseMapper.toDetailDTO(result.license, result.logs, role, now);
      return Result.ok(detailDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil detail lisensi";
      return Result.fail(new Error(message));
    }
  }
}

