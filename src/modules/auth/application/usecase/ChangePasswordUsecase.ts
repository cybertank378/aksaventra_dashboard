import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ChangePasswordRequestDTO } from "@/modules/auth/domain/dto/AuthRequestDTO";
import type { ChangePasswordResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import { PasswordPolicyRule } from "@/modules/auth/domain/rules/PasswordPolicyRule";

export type ChangePasswordInput = ChangePasswordRequestDTO;

export class ChangePasswordUsecase
  implements BaseUseCase<ChangePasswordInput, Result<ChangePasswordResponseDTO, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly hasher: PasswordHasherInterface,
  ) {}

  public async execute(
    input: ChangePasswordInput,
  ): Promise<Result<ChangePasswordResponseDTO, string>> {
    const user = await this.authRepo.findUserById(input.userId);
    if (!user) {
      return Result.fail("User not found");
    }

    const isMatch = await this.hasher.compare(input.oldPassword, user.passwordHash);
    if (!isMatch) {
      return Result.fail("Incorrect current password");
    }

    const passwordValidation = PasswordPolicyRule.validate(input.newPassword);
    if (!passwordValidation.isValid) {
      return Result.fail(passwordValidation.message || "Invalid new password format");
    }

    const newHash = await this.hasher.hash(input.newPassword);
    user.updatePassword(newHash);
    await this.authRepo.updateUser(user);

    return Result.ok({ success: true, message: "Password updated successfully" });
  }
}

export { ChangePasswordUsecase as ChangePasswordUseCase };
