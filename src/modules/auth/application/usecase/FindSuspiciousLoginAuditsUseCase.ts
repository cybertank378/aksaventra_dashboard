import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface FindSuspiciousLoginAuditsInput {
  limit?: number;
}

export class FindSuspiciousLoginAuditsUseCase
  implements BaseUseCase<FindSuspiciousLoginAuditsInput, Result<LoginAuditEntity[], string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(
    input: FindSuspiciousLoginAuditsInput,
  ): Promise<Result<LoginAuditEntity[], string>> {
    const records = await this.authRepo.findSuspiciousLoginAudits(input.limit);
    return Result.ok(records);
  }
}
