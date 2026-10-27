import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface VerifyEmailInput {
  token: string;
}

export class VerifyEmailUseCase implements BaseUseCase<VerifyEmailInput, Result<boolean, string>> {
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: VerifyEmailInput): Promise<Result<boolean, string>> {
    const tokenEntity = await this.authRepo.findEmailVerificationToken(input.token);
    if (!tokenEntity || !tokenEntity.isValid()) {
      return Result.fail("Invalid or expired verification token");
    }

    const user = await this.authRepo.findUserById(tokenEntity.userId);
    if (!user) {
      return Result.fail("User not found");
    }

    tokenEntity.markAsUsed();
    await this.authRepo.saveEmailVerificationToken(tokenEntity);

    user.activate();
    await this.authRepo.updateUser(user);

    return Result.ok(true);
  }
}
