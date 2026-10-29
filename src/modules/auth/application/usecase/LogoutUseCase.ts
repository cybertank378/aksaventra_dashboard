import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LogoutRequestDTO } from "@/modules/auth/domain/dto/AuthRequestDTO";
import type { LogoutResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export type LogoutUseCaseInput = LogoutRequestDTO;

export class LogoutUseCase
  implements BaseUseCase<LogoutUseCaseInput, Result<LogoutResponseDTO, string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: LogoutUseCaseInput): Promise<Result<LogoutResponseDTO, string>> {
    const success = await this.authRepo.deleteSession(input.token);
    return Result.ok({ success });
  }
}
