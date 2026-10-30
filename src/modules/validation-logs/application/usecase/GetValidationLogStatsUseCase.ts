import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ValidationLogStatsDTO } from "../../domain/dto/ValidationLogResponseDTO";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";

export class GetValidationLogStatsUseCase
  implements BaseUseCase<void, Result<ValidationLogStatsDTO, string>>
{
  constructor(private readonly repo: ValidationLogRepositoryInterface) {}

  public async execute(): Promise<Result<ValidationLogStatsDTO, string>> {
    try {
      const stats = await this.repo.getStats24h();
      return Result.ok(stats);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat statistik log validasi";
      return Result.fail(message);
    }
  }
}
