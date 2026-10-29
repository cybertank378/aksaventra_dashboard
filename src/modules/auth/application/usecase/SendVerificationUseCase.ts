import { randomBytes, randomUUID } from "node:crypto";
import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { EmailVerificationTokenEntity } from "@/modules/auth/domain/entity/EmailVerificationTokenEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { MailProviderInterface } from "@/modules/auth/domain/interfaces/MailProviderInterface";

export interface SendVerificationInput {
  userId: string;
}

export class SendVerificationUseCase
  implements BaseUseCase<SendVerificationInput, Result<boolean, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly mailProvider: MailProviderInterface,
  ) {}

  public async execute(input: SendVerificationInput): Promise<Result<boolean, string>> {
    const user = await this.authRepo.findUserById(input.userId);
    if (!user) {
      return Result.fail("User not found");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const verificationToken = EmailVerificationTokenEntity.create({
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt,
      isUsed: false,
    });

    await this.authRepo.saveEmailVerificationToken(verificationToken);

    await this.mailProvider.sendMail({
      to: user.email,
      subject: "Aksaventra - Verifikasi Alamat Email",
      html: `<p>Klik tautan berikut untuk memverifikasi email Anda: <a href="/verify-email?token=${token}">Verifikasi Email</a></p>`,
    });

    return Result.ok(true);
  }
}
