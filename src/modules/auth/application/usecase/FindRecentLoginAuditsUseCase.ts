import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface FindRecentLoginAuditsInput {
  limit?: number;
}

export class FindRecentLoginAuditsUseCase
  implements BaseUseCase<FindRecentLoginAuditsInput, Result<LoginAuditEntity[], string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(
    input: FindRecentLoginAuditsInput,
  ): Promise<Result<LoginAuditEntity[], string>> {
    const records = await this.authRepo.findRecentLoginAudits(input.limit);
    return Result.ok(records);
  }
}
