import { Result } from "@/core/domain/Result";
import type { VerifyChecksumRequestDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type { VerifyChecksumResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type { EngineMonitorRepositoryInterface } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";
import { BinaryIntegrityMatchRule } from "@/modules/engine-validation/domain/rules/BinaryIntegrityMatchRule";

export class VerifyBinaryChecksumUseCase {
  constructor(private readonly repo: EngineMonitorRepositoryInterface) {}

  public async execute(dto: VerifyChecksumRequestDTO): Promise<Result<VerifyChecksumResponseDTO>> {
    try {
      const releaseRecord = await this.repo.findBinaryReleaseByVersion(dto.version);
      const evaluation = BinaryIntegrityMatchRule.evaluate(dto.sha256Hash, releaseRecord);

      const response: VerifyChecksumResponseDTO = {
        version: dto.version,
        providedHash: dto.sha256Hash,
        expectedHash: evaluation.expectedHash,
        outcome: evaluation.outcome,
        isTrusted: evaluation.isTrusted,
        releaseId: evaluation.releaseId,
        channel: evaluation.channel,
        checkedAt: new Date().toISOString(),
      };

      return Result.ok(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memverifikasi checksum biner engine";
      return Result.fail(message);
    }
  }
}
