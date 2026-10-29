import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { VerifyEmailRequestDTO } from "@/modules/auth/domain/dto/AuthRequestDTO";
import type { VerifyEmailResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export type VerifyEmailInput = VerifyEmailRequestDTO;

export class VerifyEmailUseCase
  implements BaseUseCase<VerifyEmailInput, Result<VerifyEmailResponseDTO, string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: VerifyEmailInput): Promise<Result<VerifyEmailResponseDTO, string>> {
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

    return Result.ok({ success: true, message: "Email successfully verified" });
  }
}
