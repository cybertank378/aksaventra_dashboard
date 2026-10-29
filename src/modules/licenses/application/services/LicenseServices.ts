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

export class LicenseServices extends BaseService {
  private readonly validateLicenseUseCase: ValidateLicenseUseCase;

  constructor(
    repo: LicenseRepositoryInterface,
    validationLogRepo?: LicenseValidationLogRepositoryInterface,
  ) {
    super("LicenseServices");
    this.validateLicenseUseCase = new ValidateLicenseUseCase(repo, validationLogRepo);
  }

  public validateLicense(
    dto: ValidateLicenseRequestDTO,
  ): Promise<Result<ValidateLicenseSuccessResponseDTO, LicenseValidationError>> {
    return this.execute(() => this.validateLicenseUseCase.execute(dto));
  }
}

export { LicenseServices as LicenseService };
