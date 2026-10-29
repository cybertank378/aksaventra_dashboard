import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import {
  type LicenseValidationError,
  ValidateLicenseUseCase,
} from "@/modules/licenses/application/usecase/ValidateLicenseUseCase";
import type { ValidateLicenseRequestDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { ValidateLicenseSuccessResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
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
  //////////////////////////////////////////////////////////////
  // LICENSE USE CASES
  //////////////////////////////////////////////////////////////

  private readonly validateLicenseUseCase: ValidateLicenseUseCase;

  //////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  //////////////////////////////////////////////////////////////

  constructor(
    repo: LicenseRepositoryInterface,
    validationLogRepo?: LicenseValidationLogRepositoryInterface,
  ) {
    super("LicenseService");

    ////////////////////////////////////////////////////////////
    // VALIDATION
    ////////////////////////////////////////////////////////////

    this.validateLicenseUseCase = new ValidateLicenseUseCase(repo, validationLogRepo);
  }

  /* ==========================================================
   * VALIDATE LICENSE
   * ======================================================== */

  validateLicense(
    request: ValidateLicenseRequestDTO,
  ): Promise<Result<ValidateLicenseSuccessResponseDTO, LicenseValidationError>> {
    return this.execute(() => this.validateLicenseUseCase.execute(request));
  }
}

export { LicenseServices as LicenseService };
