import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { TimeSeriesChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { TimeSeriesBucketRule } from "@/modules/dashboards/domain/rules/TimeSeriesBucketRule";
import { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";
import { DASHBOARD_TIMEZONE } from "@/modules/dashboards/shared/constants/dashboardConstants";

export class GetIssuanceTrendUseCase
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

      // 6-month window: start 5 months ago at month beginning
      const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateRange = new DateRange(startDate, endDate);

      const [issuedRecords, activatedRecords] = await Promise.all([
        this.repository.aggregateLicensesIssued(dateRange, timezone),
        this.repository.aggregateLicensesActivated(dateRange, timezone),
      ]);

      const issuedPoints = TimeSeriesBucketRule.fillBuckets(
        startDate,
        endDate,
        "month",
        issuedRecords.map((r) => ({ bucket: r.bucket, value: r.count })),
        timezone,
      );

      const activatedPoints = TimeSeriesBucketRule.fillBuckets(
        startDate,
        endDate,
        "month",
        activatedRecords.map((r) => ({ bucket: r.bucket, value: r.count })),
        timezone,
      );

      const response: TimeSeriesChartResponseDTO = {
        range: "90d",
        granularity: "month",
        timezone,
        series: [
          {
            key: "issued",
            label: "Diterbitkan",
            total: issuedPoints.reduce((sum, p) => sum + p.value, 0),
            points: issuedPoints.map((p) => p.toJSON()),
          },
          {
            key: "activated",
            label: "Diaktivasi",
            total: activatedPoints.reduce((sum, p) => sum + p.value, 0),
            points: activatedPoints.map((p) => p.toJSON()),
          },
        ],
      };

      return Result.ok(response);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memuat tren penerbitan lisensi";
      return Result.fail(msg);
    }
  }
}
