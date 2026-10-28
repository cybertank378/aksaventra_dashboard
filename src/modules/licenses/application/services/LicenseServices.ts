import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { ValidateLicenseRequestDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { ValidateLicenseSuccessResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import {
  type LicenseValidationError,
  ValidateLicenseUseCase,
} from "../usecase/ValidateLicenseUseCase";

export class LicenseServices extends BaseService {
  private readonly validateLicenseUseCase: ValidateLicenseUseCase;

  constructor(repo: LicenseRepositoryInterface) {
    super("LicenseServices");
    this.validateLicenseUseCase = new ValidateLicenseUseCase(repo);
  }

  public validateLicense(
    dto: ValidateLicenseRequestDTO,
  ): Promise<Result<ValidateLicenseSuccessResponseDTO, LicenseValidationError>> {
    return this.execute(() => this.validateLicenseUseCase.execute(dto));
  }
}

export { LicenseServices as LicenseService };
