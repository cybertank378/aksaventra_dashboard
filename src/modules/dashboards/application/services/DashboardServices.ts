import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import { GetDashboardSummaryUseCase } from "@/modules/dashboards/application/usecase/GetDashboardSummaryUseCase";
import { GetExpiryForecastUseCase } from "@/modules/dashboards/application/usecase/GetExpiryForecastUseCase";
import { GetIssuanceTrendUseCase } from "@/modules/dashboards/application/usecase/GetIssuanceTrendUseCase";
import { GetLicenseStatusDistributionUseCase } from "@/modules/dashboards/application/usecase/GetLicenseStatusDistributionUseCase";
import { GetRecentActivitiesUseCase } from "@/modules/dashboards/application/usecase/GetRecentActivitiesUseCase";
import { GetRecentLicensesUseCase } from "@/modules/dashboards/application/usecase/GetRecentLicensesUseCase";
import { GetValidationTrendUseCase } from "@/modules/dashboards/application/usecase/GetValidationTrendUseCase";
import type {
  ActivitiesQueryDTO,
  ChartRangeQueryDTO,
  RecentLicensesQueryDTO,
} from "@/modules/dashboards/domain/dto/DashboardRequestDTO";
import type {
  DashboardActivityDTO,
  DashboardSummaryResponseDTO,
  DistributionChartResponseDTO,
  RecentLicensesResponseDTO,
  TimeSeriesChartResponseDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";

export class DashboardServices extends BaseService {
  private readonly getSummaryUseCase: GetDashboardSummaryUseCase;
  private readonly getRecentLicensesUseCase: GetRecentLicensesUseCase;
  private readonly getRecentActivitiesUseCase: GetRecentActivitiesUseCase;
  private readonly getValidationTrendUseCase: GetValidationTrendUseCase;
  private readonly getLicenseStatusDistributionUseCase: GetLicenseStatusDistributionUseCase;
  private readonly getIssuanceTrendUseCase: GetIssuanceTrendUseCase;
  private readonly getExpiryForecastUseCase: GetExpiryForecastUseCase;

  constructor(repository: DashboardRepositoryInterface, clock: ClockInterface) {
    super("DashboardServices");
    this.getSummaryUseCase = new GetDashboardSummaryUseCase(repository, clock);
    this.getRecentLicensesUseCase = new GetRecentLicensesUseCase(repository, clock);
    this.getRecentActivitiesUseCase = new GetRecentActivitiesUseCase(repository);
    this.getValidationTrendUseCase = new GetValidationTrendUseCase(repository, clock);
    this.getLicenseStatusDistributionUseCase = new GetLicenseStatusDistributionUseCase(
      repository,
      clock,
    );
    this.getIssuanceTrendUseCase = new GetIssuanceTrendUseCase(repository, clock);
    this.getExpiryForecastUseCase = new GetExpiryForecastUseCase(repository, clock);
  }

  public getSummary(): Promise<Result<DashboardSummaryResponseDTO, string>> {
    return this.execute(() => this.getSummaryUseCase.execute());
  }

  public getRecentLicenses(
    dto?: RecentLicensesQueryDTO,
  ): Promise<Result<RecentLicensesResponseDTO, string>> {
    return this.execute(() => this.getRecentLicensesUseCase.execute(dto));
  }

  public getRecentActivities(
    dto?: ActivitiesQueryDTO,
  ): Promise<Result<DashboardActivityDTO[], string>> {
    return this.execute(() => this.getRecentActivitiesUseCase.execute(dto));
  }

  public getValidationTrend(
    dto?: ChartRangeQueryDTO,
  ): Promise<Result<TimeSeriesChartResponseDTO<ValidationTrendSeriesKey>, string>> {
    return this.execute(() => this.getValidationTrendUseCase.execute(dto));
  }

  public getLicenseStatusDistribution(): Promise<Result<DistributionChartResponseDTO, string>> {
    return this.execute(() => this.getLicenseStatusDistributionUseCase.execute());
  }

  public getIssuanceTrend(): Promise<Result<TimeSeriesChartResponseDTO, string>> {
    return this.execute(() => this.getIssuanceTrendUseCase.execute());
  }

  public getExpiryForecast(): Promise<Result<TimeSeriesChartResponseDTO, string>> {
    return this.execute(() => this.getExpiryForecastUseCase.execute());
  }
}
