import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface LogoutAllUseCaseInput {
  userId: string;
}

export class LogoutAllUsecase
  implements BaseUseCase<LogoutAllUseCaseInput, Result<number, string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: LogoutAllUseCaseInput): Promise<Result<number, string>> {
    const deletedCount = await this.authRepo.deleteSessionsByUserId(input.userId);
    return Result.ok(deletedCount);
  }
}
