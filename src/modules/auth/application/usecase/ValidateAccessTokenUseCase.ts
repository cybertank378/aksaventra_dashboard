import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { CurrentAuthResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";

export interface ValidateAccessTokenInput {
  token: string;
}

export class ValidateAccessTokenUseCase
  implements BaseUseCase<ValidateAccessTokenInput, Result<CurrentAuthResponseDTO, string>>
{
  private readonly authRepo?: AuthRepositoryInterface;
  private readonly tokenProvider: TokenProviderInterface;

  constructor(
    repoOrTokenProvider: AuthRepositoryInterface | TokenProviderInterface,
    maybeTokenProvider?: TokenProviderInterface,
  ) {
    if (maybeTokenProvider) {
      this.authRepo = repoOrTokenProvider as AuthRepositoryInterface;
      this.tokenProvider = maybeTokenProvider;
    } else {
      this.tokenProvider = repoOrTokenProvider as TokenProviderInterface;
    }
  }

  public async execute(
    input: ValidateAccessTokenInput,
  ): Promise<Result<CurrentAuthResponseDTO, string>> {
    const payload = await this.tokenProvider.verifyToken(input.token);
    if (!payload) {
      return Result.fail("Invalid or expired token");
    }

    if (this.authRepo && payload.sub) {
      const user = await this.authRepo.findUserById(payload.sub);
      if (!user || !user.isActive) {
        return Result.fail("User not found or inactive");
      }
      return Result.ok({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive,
      });
    }

    return Result.ok({
      id: payload.sub || "",
      email: payload.email || "",
      role: payload.role,
      isActive: true,
    });
  }
}
