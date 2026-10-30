import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { DashboardSummaryResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { DashboardSummaryEntity } from "@/modules/dashboards/domain/entity/DashboardSummaryEntity";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";
import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";

export class GetDashboardSummaryUseCase
  implements BaseUseCase<void, Result<DashboardSummaryResponseDTO, string>>
{
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly clock: ClockInterface,
  ) {}

  public async execute(): Promise<Result<DashboardSummaryResponseDTO, string>> {
    try {
      const now = this.clock.now();
      const expiringUntil = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

      // This Month Range (1st of this month to now)
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthRange = new DateRange(thisMonthStart, now);

      // Last Month Range (1st of last month to 1st of this month)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthRange = new DateRange(lastMonthStart, thisMonthStart);

      const [counts, _thisMonthCreated, lastMonthCreated, expiringLicenses] = await Promise.all([
        this.repository.countLicenseStates(now, expiringUntil),
        this.repository.countLicensesCreatedBetween(thisMonthRange),
        this.repository.countLicensesCreatedBetween(lastMonthRange),
        this.repository.findExpiringLicenses(now, expiringUntil, 2),
      ]);

      const entity = new DashboardSummaryEntity({
        activeLicensesCount: counts.active,
        previousActiveLicensesCount: lastMonthCreated,
        expiringLicensesCount: counts.expiringSoon,
        expiredOrRevokedCount: counts.expired + counts.suspended,
        activeWithHwidCount: counts.activeWithHwid,
        renewalWarnings: expiringLicenses,
        now,
      });

      return Result.ok(entity.toDTO());
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memuat ringkasan dasbor";
      return Result.fail(msg);
    }
  }
}
