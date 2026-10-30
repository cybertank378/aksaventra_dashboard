import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { UserRole } from "@/libs/enums";
import { CreateLicenseUseCase } from "@/modules/licenses/application/usecase/CreateLicenseUseCase";
import { GetLicenseDetailUseCase } from "@/modules/licenses/application/usecase/GetLicenseDetailUseCase";
import { GetLicenseStatsUseCase } from "@/modules/licenses/application/usecase/GetLicenseStatsUseCase";
import { ListLicensesUseCase } from "@/modules/licenses/application/usecase/ListLicensesUseCase";
import {
  ResetDeviceHwidUseCase,
  type ResetHwidParams,
} from "@/modules/licenses/application/usecase/ResetDeviceHwidUseCase";
import { UpdateLicenseStatusUseCase } from "@/modules/licenses/application/usecase/UpdateLicenseStatusUseCase";
import {
  type LicenseValidationError,
  ValidateLicenseUseCase,
} from "@/modules/licenses/application/usecase/ValidateLicenseUseCase";
import type {
  CreateLicenseDTO,
  LicenseQueryDTO,
  UpdateLicenseStatusDTO,
  ValidateLicenseRequestDTO,
} from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type {
  LicenseAdminItemDTO,
  LicenseDetailResponseDTO,
  LicenseListResponseDTO,
  LicenseStatsResponseDTO,
  ValidateLicenseSuccessResponseDTO,
} from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type {
  LicenseRepositoryInterface,
  LicenseValidationLogRepositoryInterface,
} from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

/* ============================================================
 * LICENSE SERVICE
 * ============================================================
 *
 * Responsibility:
 * - Application Facade
 * - UseCase Orchestrator
 * - Transaction Boundary
 * - License Workflow Coordinator
 * - Thin Application Entry Point
 *
 * NOT:
 * - Business Logic Layer
 * - repo Wrapper
 * - Database Layer
 * ============================================================
 */

export class LicenseServices extends BaseService {
  private readonly validateLicenseUseCase: ValidateLicenseUseCase;
  private readonly listLicensesUseCase: ListLicensesUseCase;
  private readonly getLicenseStatsUseCase: GetLicenseStatsUseCase;
  private readonly getLicenseDetailUseCase: GetLicenseDetailUseCase;
  private readonly createLicenseUseCase: CreateLicenseUseCase;
  private readonly resetDeviceHwidUseCase: ResetDeviceHwidUseCase;
  private readonly updateLicenseStatusUseCase: UpdateLicenseStatusUseCase;

  constructor(
    repo: LicenseRepositoryInterface,
    validationLogRepo?: LicenseValidationLogRepositoryInterface,
  ) {
    super("LicenseService");

    this.validateLicenseUseCase = new ValidateLicenseUseCase(repo, validationLogRepo);
    this.listLicensesUseCase = new ListLicensesUseCase(repo);
    this.getLicenseStatsUseCase = new GetLicenseStatsUseCase(repo);
    this.getLicenseDetailUseCase = new GetLicenseDetailUseCase(repo);
    this.createLicenseUseCase = new CreateLicenseUseCase(repo);
    this.resetDeviceHwidUseCase = new ResetDeviceHwidUseCase(repo);
    this.updateLicenseStatusUseCase = new UpdateLicenseStatusUseCase(repo);
  }

  /* ==========================================================
   * CLIENT ENGINE VALIDATION
   * ======================================================== */

  public validateLicense(
    request: ValidateLicenseRequestDTO,
  ): Promise<Result<ValidateLicenseSuccessResponseDTO, LicenseValidationError>> {
    return this.validateLicenseUseCase.execute(request);
  }

  /* ==========================================================
   * ADMINISTRATIVE USE CASES
   * ======================================================== */

  public listLicenses(
    query: LicenseQueryDTO,
    role?: UserRole,
  ): Promise<Result<LicenseListResponseDTO, Error>> {
    return this.listLicensesUseCase.execute(query, role);
  }

  public getStats(now?: Date): Promise<Result<LicenseStatsResponseDTO, Error>> {
    return this.getLicenseStatsUseCase.execute(now);
  }

  public getLicenseDetail(
    id: string,
    role?: UserRole,
  ): Promise<Result<LicenseDetailResponseDTO, Error>> {
    return this.getLicenseDetailUseCase.execute(id, role);
  }

  public createLicense(
    dto: CreateLicenseDTO,
    userId?: string,
    ipAddress?: string,
    role?: UserRole,
  ): Promise<Result<LicenseAdminItemDTO, Error>> {
    return this.createLicenseUseCase.execute(dto, userId, ipAddress, role);
  }

  public resetDeviceHwid(
    params: ResetHwidParams,
    userId?: string,
    ipAddress?: string,
    role?: UserRole,
  ): Promise<Result<LicenseAdminItemDTO, Error>> {
    return this.resetDeviceHwidUseCase.execute(params, userId, ipAddress, role);
  }

  public updateLicenseStatus(
    id: string,
    dto: UpdateLicenseStatusDTO,
    userId?: string,
    ipAddress?: string,
    role?: UserRole,
  ): Promise<Result<LicenseAdminItemDTO, Error>> {
    return this.updateLicenseStatusUseCase.execute(id, dto, userId, ipAddress, role);
  }
}
