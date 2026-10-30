import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { TimeSeriesChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { TimeSeriesBucketRule } from "@/modules/dashboards/domain/rules/TimeSeriesBucketRule";
import { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";
import { DASHBOARD_TIMEZONE } from "@/modules/dashboards/shared/constants/dashboardConstants";

export class GetExpiryForecastUseCase
  implements BaseUseCase<void, Result<TimeSeriesChartResponseDTO, string>>
{
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly clock: ClockInterface,
  ) {}

  public async execute(): Promise<Result<TimeSeriesChartResponseDTO, string>> {
    try {
      const now = this.clock.now();
      const timezone = DASHBOARD_TIMEZONE;

      // 6-month future projection: from current month to 5 months ahead (total 6 months)
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 5, 28);
      const dateRange = new DateRange(startDate, endDate);

      const expiringRecords = await this.repository.aggregateLicensesExpiring(
        dateRange,
        now,
        timezone,
      );

      const points = TimeSeriesBucketRule.fillBuckets(
        startDate,
        endDate,
        "month",
        expiringRecords.map((r) => ({ bucket: r.bucket, value: r.count })),
        timezone,
      );

      const response: TimeSeriesChartResponseDTO = {
        range: "90d",
        granularity: "month",
        timezone,
        series: [
          {
            key: "expiring",
            label: "Akan Kedaluwarsa",
            total: points.reduce((sum, p) => sum + p.value, 0),
            points: points.map((p) => p.toJSON()),
          },
        ],
      };

      return Result.ok(response);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Gagal memuat proyeksi kedaluwarsa lisensi";
      return Result.fail(msg);
    }
  }
}
