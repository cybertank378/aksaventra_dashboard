import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import { PasswordPolicyRule } from "@/modules/auth/domain/rules/PasswordPolicyRule";

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase
  implements BaseUseCase<ResetPasswordInput, Result<boolean, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly hasher: PasswordHasherInterface,
  ) {}

  public async execute(input: ResetPasswordInput): Promise<Result<boolean, string>> {
    const passwordValidation = PasswordPolicyRule.validate(input.newPassword);
    if (!passwordValidation.isValid) {
      return Result.fail(passwordValidation.message || "Invalid password format");
    }

    const resetToken = await this.authRepo.findPasswordResetToken(input.token);
    if (!resetToken || !resetToken.isValid()) {
      return Result.fail("Invalid or expired reset token");
    }

    const user = await this.authRepo.findUserById(resetToken.userId);
    if (!user) {
      return Result.fail("User not found");
    }

    const newHash = await this.hasher.hash(input.newPassword);
    user.updatePassword(newHash);
    await this.authRepo.updateUser(user);

    resetToken.markAsUsed();
    await this.authRepo.savePasswordResetToken(resetToken);

    // Revoke all existing sessions for security
    await this.authRepo.deleteSessionsByUserId(user.id);

    return Result.ok(true);
  }
}
