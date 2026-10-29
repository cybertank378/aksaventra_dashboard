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

/* ============================================================
 * DASHBOARD SERVICE
 * ============================================================
 *
 * Responsibility:
 * - Application Facade
 * - UseCase Orchestrator
 * - Transaction Boundary
 * - Dashboard Analytics Coordinator
 * - Thin Application Entry Point
 *
 * NOT:
 * - Business Logic Layer
 * - repo Wrapper
 * - Database Layer
 * ============================================================
 */

export class DashboardServices extends BaseService {
  //////////////////////////////////////////////////////////////
  // DASHBOARD USE CASES
  //////////////////////////////////////////////////////////////

  private readonly getSummaryUseCase: GetDashboardSummaryUseCase;
  private readonly getRecentLicensesUseCase: GetRecentLicensesUseCase;
  private readonly getRecentActivitiesUseCase: GetRecentActivitiesUseCase;
  private readonly getValidationTrendUseCase: GetValidationTrendUseCase;
  private readonly getLicenseStatusDistributionUseCase: GetLicenseStatusDistributionUseCase;
  private readonly getIssuanceTrendUseCase: GetIssuanceTrendUseCase;
  private readonly getExpiryForecastUseCase: GetExpiryForecastUseCase;

  //////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  //////////////////////////////////////////////////////////////

  constructor(repository: DashboardRepositoryInterface, clock: ClockInterface) {
    super("DashboardService");

    ////////////////////////////////////////////////////////////
    // SUMMARY & RECENT
    ////////////////////////////////////////////////////////////

    this.getSummaryUseCase = new GetDashboardSummaryUseCase(repository, clock);
    this.getRecentLicensesUseCase = new GetRecentLicensesUseCase(repository, clock);
    this.getRecentActivitiesUseCase = new GetRecentActivitiesUseCase(repository);

    ////////////////////////////////////////////////////////////
    // CHARTS & ANALYTICS
    ////////////////////////////////////////////////////////////

    this.getValidationTrendUseCase = new GetValidationTrendUseCase(repository, clock);
    this.getLicenseStatusDistributionUseCase = new GetLicenseStatusDistributionUseCase(
      repository,
      clock,
    );
    this.getIssuanceTrendUseCase = new GetIssuanceTrendUseCase(repository, clock);
    this.getExpiryForecastUseCase = new GetExpiryForecastUseCase(repository, clock);
  }

  /* ==========================================================
   * GET SUMMARY
   * ======================================================== */

  getSummary(): Promise<Result<DashboardSummaryResponseDTO, string>> {
    return this.execute(() => this.getSummaryUseCase.execute());
  }

  /* ==========================================================
   * GET RECENT LICENSES
   * ======================================================== */

  getRecentLicenses(
    request?: RecentLicensesQueryDTO,
  ): Promise<Result<RecentLicensesResponseDTO, string>> {
    return this.execute(() => this.getRecentLicensesUseCase.execute(request));
  }

  /* ==========================================================
   * GET RECENT ACTIVITIES
   * ======================================================== */

  getRecentActivities(
    request?: ActivitiesQueryDTO,
  ): Promise<Result<DashboardActivityDTO[], string>> {
    return this.execute(() => this.getRecentActivitiesUseCase.execute(request));
  }

  /* ==========================================================
   * GET VALIDATION TREND
   * ======================================================== */

  getValidationTrend(
    request?: ChartRangeQueryDTO,
  ): Promise<Result<TimeSeriesChartResponseDTO<ValidationTrendSeriesKey>, string>> {
    return this.execute(() => this.getValidationTrendUseCase.execute(request));
  }

  /* ==========================================================
   * GET LICENSE STATUS DISTRIBUTION
   * ======================================================== */

  getLicenseStatusDistribution(): Promise<Result<DistributionChartResponseDTO, string>> {
    return this.execute(() => this.getLicenseStatusDistributionUseCase.execute());
  }

  /* ==========================================================
   * GET ISSUANCE TREND
   * ======================================================== */

  getIssuanceTrend(): Promise<Result<TimeSeriesChartResponseDTO, string>> {
    return this.execute(() => this.getIssuanceTrendUseCase.execute());
  }

  /* ==========================================================
   * GET EXPIRY FORECAST
   * ======================================================== */

  getExpiryForecast(): Promise<Result<TimeSeriesChartResponseDTO, string>> {
    return this.execute(() => this.getExpiryForecastUseCase.execute());
  }
}

export { DashboardServices as DashboardService };
