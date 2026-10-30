import { Result } from "@/core/domain/Result";
import type { BinaryIntegrityItemDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type { EngineMonitorRepositoryInterface } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";

export class ListBinaryIntegrityRegistryUseCase {
  constructor(private readonly repo: EngineMonitorRepositoryInterface) {}

  public async execute(): Promise<Result<BinaryIntegrityItemDTO[]>> {
    try {
      const releases = await this.repo.listBinaryReleases();
      return Result.ok(releases);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengambil daftar integritas biner engine";
      return Result.fail(message);
    }
  }
}
