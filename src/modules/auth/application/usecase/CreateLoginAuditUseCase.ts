import { randomUUID } from "node:crypto";
import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export interface CreateLoginAuditInput {
  userId?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}

export class CreateLoginAuditUseCase
  implements BaseUseCase<CreateLoginAuditInput, Result<LoginAuditEntity, string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(input: CreateLoginAuditInput): Promise<Result<LoginAuditEntity, string>> {
    const audit = LoginAuditEntity.create({
      id: randomUUID(),
      userId: input.userId,
      action: input.action,
      target: input.target,
      details: input.details,
      ipAddress: input.ipAddress,
    });

    const saved = await this.authRepo.createLoginAudit(audit);
    return Result.ok(saved);
  }
}
