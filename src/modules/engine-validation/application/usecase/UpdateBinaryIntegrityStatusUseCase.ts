import { Result } from "@/core/domain/Result";
import type { PatchBinaryStatusDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type { PatchBinaryStatusResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type { EngineMonitorRepositoryInterface } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";

export class UpdateBinaryIntegrityStatusUseCase {
  constructor(private readonly repo: EngineMonitorRepositoryInterface) {}

  public async execute(
    dto: PatchBinaryStatusDTO,
    actorId?: string,
  ): Promise<Result<PatchBinaryStatusResponseDTO>> {
    try {
      const existing = await this.repo.findBinaryReleaseById(dto.id);
      if (!existing) {
        return Result.fail(`Biner engine dengan ID "${dto.id}" tidak ditemukan.`);
      }

      const updated = await this.repo.updateBinaryStatus(dto, actorId);
      return Result.ok(updated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui status integritas biner";
      return Result.fail(message);
    }
  }
}
