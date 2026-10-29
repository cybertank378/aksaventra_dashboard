import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { TokenResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";

export interface RefreshTokenUseCaseInput {
  refreshToken: string;
}

export class RefreshTokenUseCase
  implements BaseUseCase<RefreshTokenUseCaseInput, Result<TokenResponseDTO, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly tokenProvider: TokenProviderInterface,
  ) {}

  public async execute(input: RefreshTokenUseCaseInput): Promise<Result<TokenResponseDTO, string>> {
    const payload = await this.tokenProvider.verifyToken(input.refreshToken);
    if (!payload) {
      return Result.fail("Invalid or expired refresh token");
    }

    const user = await this.authRepo.findUserById(payload.sub);
    if (!user || !user.isActive) {
      return Result.fail("User inactive or no longer exists");
    }

    const newAccessToken = await this.tokenProvider.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await this.tokenProvider.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return Result.ok({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
        expiresIn: 3600,
      },
    });
  }
}
