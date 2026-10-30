import { Result } from "@/core/domain/Result";
import type { EngineMonitorSummaryResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type { EngineMonitorRepositoryInterface } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";

export class GetEngineMonitorSummaryUseCase {
  constructor(private readonly repo: EngineMonitorRepositoryInterface) {}

  public async execute(): Promise<Result<EngineMonitorSummaryResponseDTO>> {
    try {
      const summary = await this.repo.getSummaryMetrics();
      return Result.ok(summary);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengambil metrik summary engine monitor";
      return Result.fail(message);
    }
  }
}
