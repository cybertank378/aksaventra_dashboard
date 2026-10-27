import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface FindLoginAuditsByUserInput {
  userId: string;
  limit?: number;
}

export class FindLoginAuditsByUserUseCase
  implements BaseUseCase<FindLoginAuditsByUserInput, Result<LoginAuditEntity[], string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(
    input: FindLoginAuditsByUserInput,
  ): Promise<Result<LoginAuditEntity[], string>> {
    const records = await this.authRepo.findLoginAuditsByUserId(input.userId, input.limit);
    return Result.ok(records);
  }
}
