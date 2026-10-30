import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { DistributionChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { DashboardMapper } from "@/modules/dashboards/domain/mapper/DashboardMapper";
import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";

export class GetLicenseStatusDistributionUseCase
  implements BaseUseCase<void, Result<DistributionChartResponseDTO, string>>
{
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly clock: ClockInterface,
  ) {}

  public async execute(): Promise<Result<DistributionChartResponseDTO, string>> {
    try {
      const now = this.clock.now();
      const expiringUntil = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

      const counts = await this.repository.countLicenseStates(now, expiringUntil);
      const dto = DashboardMapper.toDistributionDTO({
        active: counts.active,
        expiringSoon: counts.expiringSoon,
        expired: counts.expired,
        suspended: counts.suspended,
      });

      return Result.ok(dto);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memuat distribusi status lisensi";
      return Result.fail(msg);
    }
  }
}
