import { randomBytes, randomUUID } from "node:crypto";
import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { PasswordResetTokenEntity } from "@/modules/auth/domain/entity/PasswordResetTokenEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { MailProviderInterface } from "@/modules/auth/domain/interfaces/MailProviderInterface";

export interface ForgotPasswordInput {
  email: string;
}

export class ForgotPasswordUseCase
  implements BaseUseCase<ForgotPasswordInput, Result<boolean, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly mailProvider: MailProviderInterface,
  ) {}

  public async execute(input: ForgotPasswordInput): Promise<Result<boolean, string>> {
    const user = await this.authRepo.findUserByEmail(input.email);
    if (!user) {
      // Return ok to prevent user enumeration
      return Result.ok(true);
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const resetToken = PasswordResetTokenEntity.create({
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt,
      isUsed: false,
    });

    await this.authRepo.savePasswordResetToken(resetToken);

    await this.mailProvider.sendMail({
      to: user.email,
      subject: "Aksaventra - Reset Password",
      html: `<p>Klik tautan berikut untuk mereset password akun Anda: <a href="/reset-password?token=${token}">Reset Password</a></p>`,
    });

    return Result.ok(true);
  }
}
