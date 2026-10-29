import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LogoutAllRequestDTO } from "@/modules/auth/domain/dto/AuthRequestDTO";
import type { LogoutResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export type LogoutAllUseCaseInput = LogoutAllRequestDTO;

export class LogoutAllUsecase
  implements BaseUseCase<LogoutAllUseCaseInput, Result<LogoutResponseDTO, string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: LogoutAllUseCaseInput): Promise<Result<LogoutResponseDTO, string>> {
    const deletedCount = await this.authRepo.deleteSessionsByUserId(input.userId);
    return Result.ok({
      success: deletedCount > 0,
      message: `${deletedCount} sessions revoked`,
    });
  }
}

export { LogoutAllUsecase as LogoutAllUseCase };
