import { Result } from "@/core/domain/Result";
import type { LicenseStatsResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";

export class GetLicenseStatsUseCase {
  constructor(private readonly repo: LicenseRepositoryInterface) {}

  public async execute(now: Date = new Date()): Promise<Result<LicenseStatsResponseDTO, Error>> {
    try {
      const stats = await this.repo.getStats(now);
      const dto = LicenseMapper.toStatsDTO(stats);
      return Result.ok(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil statistik lisensi";
      return Result.fail(new Error(message));
    }
  }
}

