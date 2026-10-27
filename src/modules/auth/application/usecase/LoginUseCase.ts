import { randomUUID } from "node:crypto";
import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LoginResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import { UserSessionEntity } from "@/modules/auth/domain/entity/UserSessionEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";
import { AuthMapper } from "@/modules/auth/domain/mapper/AuthMapper";

export interface LoginUseCaseInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export class LoginUseCase
  implements BaseUseCase<LoginUseCaseInput, Result<LoginResponseDTO, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly hasher: PasswordHasherInterface,
    private readonly tokenProvider: TokenProviderInterface,
  ) {}

  public async execute(input: LoginUseCaseInput): Promise<Result<LoginResponseDTO, string>> {
    const user = await this.authRepo.findUserByEmail(input.email);

    if (!user) {
      await this.authRepo.createLoginAudit(
        LoginAuditEntity.create({
          id: randomUUID(),
          action: "LOGIN_FAILED",
          details: `User with email ${input.email} not found`,
          ipAddress: input.ipAddress,
        }),
      );
      return Result.fail("Invalid email or password");
    }

    if (!user.isActive) {
      return Result.fail("Account is deactivated");
    }

    const isPasswordValid = await this.hasher.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.authRepo.createLoginAudit(
        LoginAuditEntity.create({
          id: randomUUID(),
          userId: user.id,
          action: "LOGIN_FAILED",
          details: "Incorrect password attempt",
          ipAddress: input.ipAddress,
        }),
      );
      return Result.fail("Invalid email or password");
    }

    user.recordLogin();
    await this.authRepo.updateUser(user);

    const accessToken = await this.tokenProvider.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.tokenProvider.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await this.authRepo.createSession(
      UserSessionEntity.create({
        id: randomUUID(),
        userId: user.id,
        token: accessToken,
        expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }),
    );

    await this.authRepo.createLoginAudit(
      LoginAuditEntity.create({
        id: randomUUID(),
        userId: user.id,
        action: "LOGIN_SUCCESS",
        details: "User successfully authenticated",
        ipAddress: input.ipAddress,
      }),
    );

    return Result.ok({
      user: AuthMapper.toDTO(user),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 3600,
      },
    });
  }
}
