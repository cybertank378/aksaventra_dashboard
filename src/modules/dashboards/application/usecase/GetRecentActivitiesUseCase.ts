import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ActivitiesQueryDTO } from "@/modules/dashboards/domain/dto/DashboardRequestDTO";
import type { DashboardActivityDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { DashboardMapper } from "@/modules/dashboards/domain/mapper/DashboardMapper";

export class GetRecentActivitiesUseCase
  implements BaseUseCase<ActivitiesQueryDTO, Result<DashboardActivityDTO[], string>>
{
  constructor(private readonly repository: DashboardRepositoryInterface) {}

  public async execute(
    dto: ActivitiesQueryDTO = {},
  ): Promise<Result<DashboardActivityDTO[], string>> {
    try {
      const rawLimit = dto.limit ?? 6;
      const limit = Math.min(Math.max(1, rawLimit), 20);

      const records = await this.repository.findRecentActivities(limit);
      const activities = records.map((r) => DashboardMapper.toActivityDTO(r));

      return Result.ok(activities);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memuat riwayat aktivitas";
      return Result.fail(msg);
    }
  }
}
