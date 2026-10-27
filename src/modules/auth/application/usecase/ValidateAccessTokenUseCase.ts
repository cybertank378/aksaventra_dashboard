import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";
import type { AuthJwtPayload } from "@/modules/auth/domain/types/AuthJwtPayload";

export interface ValidateAccessTokenInput {
  token: string;
}

export class ValidateAccessTokenUseCase
  implements BaseUseCase<ValidateAccessTokenInput, Result<AuthJwtPayload, string>>
{
  constructor(private readonly tokenProvider: TokenProviderInterface) {}

  public async execute(input: ValidateAccessTokenInput): Promise<Result<AuthJwtPayload, string>> {
    const payload = await this.tokenProvider.verifyToken(input.token);
    if (!payload) {
      return Result.fail("Invalid or expired token");
    }

    return Result.ok(payload);
  }
}
