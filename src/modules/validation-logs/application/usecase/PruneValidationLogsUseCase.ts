import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type {
  PruneValidationLogsResult,
  ValidationLogRepositoryInterface,
} from "../../domain/interfaces/ValidationLogInterfaces";

export interface PruneValidationLogsInput {
  days?: number;
}

export class PruneValidationLogsUseCase
  implements BaseUseCase<PruneValidationLogsInput, Result<PruneValidationLogsResult, string>>
{
  constructor(private readonly repo: ValidationLogRepositoryInterface) {}

  public async execute(
    input: PruneValidationLogsInput = {},
  ): Promise<Result<PruneValidationLogsResult, string>> {
    try {
      const days = input.days ?? 90;

      if (Number.isNaN(days) || days < 7) {
        return Result.fail("Batas retensi minimal adalah 7 hari untuk alasan keamanan audit trail");
      }

      const result = await this.repo.pruneLogsOlderThan(days);
      return Result.ok(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memangkas log validasi lama";
      return Result.fail(message);
    }
  }
}
