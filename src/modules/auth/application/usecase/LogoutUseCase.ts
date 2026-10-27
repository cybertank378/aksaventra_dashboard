import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface LogoutUseCaseInput {
  token: string;
}

export class LogoutUseCase implements BaseUseCase<LogoutUseCaseInput, Result<boolean, string>> {
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: LogoutUseCaseInput): Promise<Result<boolean, string>> {
    const success = await this.authRepo.deleteSession(input.token);
    return Result.ok(success);
  }
}
