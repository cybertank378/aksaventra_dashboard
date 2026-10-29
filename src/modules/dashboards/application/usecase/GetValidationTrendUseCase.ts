import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { DashboardQueryBuilder } from "@/modules/dashboards/domain/builders/DashboardQueryBuilder";
import type { ChartRangeQueryDTO } from "@/modules/dashboards/domain/dto/DashboardRequestDTO";
import type { TimeSeriesChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { ValidationTrendEntity } from "@/modules/dashboards/domain/entity/ValidationTrendEntity";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import {
  type RawBucketRecord,
  TimeSeriesBucketRule,
} from "@/modules/dashboards/domain/rules/TimeSeriesBucketRule";
import { ValidationOutcomeGroupingRule } from "@/modules/dashboards/domain/rules/ValidationOutcomeGroupingRule";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";
import type { LicenseValidationResultType } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";

export class GetValidationTrendUseCase
  implements
    BaseUseCase<
      ChartRangeQueryDTO,
      Result<TimeSeriesChartResponseDTO<ValidationTrendSeriesKey>, string>
    >
{
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly clock: ClockInterface,
  ) {}

  public async execute(
    dto: ChartRangeQueryDTO = {},
  ): Promise<Result<TimeSeriesChartResponseDTO<ValidationTrendSeriesKey>, string>> {
    try {
      const now = this.clock.now();
      const builder = DashboardQueryBuilder.create().withRange(dto.range);
      const query = builder.build();
      const dateRange = builder.buildDateRange(now);

      const records = await this.repository.aggregateValidationOutcomes(
        dateRange,
        query.granularity,
        query.timezone,
      );

      // Separate records by grouped series key
      const seriesBuckets: Record<ValidationTrendSeriesKey, RawBucketRecord[]> = {
        activated: [],
        verified: [],
        rejected: [],
        mismatch: [],
      };

      for (const rec of records) {
        const key = ValidationOutcomeGroupingRule.mapToSeriesKey(
          rec.result as LicenseValidationResultType,
        );
        seriesBuckets[key].push({
          bucket: rec.bucket,
          value: rec.count,
        });
      }

      const keys: ValidationTrendSeriesKey[] = ["activated", "verified", "rejected", "mismatch"];
      const series = keys.map((key) => {
        const points = TimeSeriesBucketRule.fillBuckets(
          dateRange.startDate,
          dateRange.endDate,
          query.granularity,
          seriesBuckets[key],
          query.timezone,
        );

        return {
          key,
          label: ValidationOutcomeGroupingRule.getSeriesLabel(key),
          points,
        };
      });

      const entity = new ValidationTrendEntity({
        range: query.range,
        granularity: query.granularity,
        timezone: query.timezone,
        series,
      });

      return Result.ok(entity.toDTO());
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memuat tren validasi engine";
      return Result.fail(msg);
    }
  }
}
