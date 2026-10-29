import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { DashboardQueryBuilder } from "@/modules/dashboards/domain/builders/DashboardQueryBuilder";
import type { RecentLicensesQueryDTO } from "@/modules/dashboards/domain/dto/DashboardRequestDTO";
import type { RecentLicensesResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { DashboardMapper } from "@/modules/dashboards/domain/mapper/DashboardMapper";
import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";

export class GetRecentLicensesUseCase
  implements BaseUseCase<RecentLicensesQueryDTO, Result<RecentLicensesResponseDTO, string>>
{
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly clock: ClockInterface,
  ) {}

  public async execute(
    dto: RecentLicensesQueryDTO = {},
  ): Promise<Result<RecentLicensesResponseDTO, string>> {
    try {
      const now = this.clock.now();
      const query = DashboardQueryBuilder.create()
        .withStatus(dto.status)
        .withPagination(dto.page, dto.limit)
        .build();

      const result = await this.repository.findRecentLicenses(
        {
          status: query.status,
          offset: query.offset,
          limit: query.limit,
        },
        now,
        EXPIRING_SOON_DAYS,
      );

      const items = result.items.map((item) => DashboardMapper.toRecentLicenseDTO(item, now));
      const totalPages = Math.ceil(result.total / query.limit) || 1;

      return Result.ok({
        items,
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages,
        counts: result.statusCounts,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memuat lisensi terbaru";
      return Result.fail(msg);
    }
  }
}
