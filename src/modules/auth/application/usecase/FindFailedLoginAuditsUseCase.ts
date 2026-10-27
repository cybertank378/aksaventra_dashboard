import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface FindFailedLoginAuditsInput {
  limit?: number;
}

export class FindFailedLoginAuditsUseCase
  implements BaseUseCase<FindFailedLoginAuditsInput, Result<LoginAuditEntity[], string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(
    input: FindFailedLoginAuditsInput,
  ): Promise<Result<LoginAuditEntity[], string>> {
    const records = await this.authRepo.findFailedLoginAudits(input.limit);
    return Result.ok(records);
  }
}
