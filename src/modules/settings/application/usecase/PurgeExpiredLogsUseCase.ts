import type { PurgeLogsDTO } from "../../domain/dto/SystemSettingsRequestDTO";
import type { PurgeResultDTO } from "../../domain/dto/SystemSettingsResponseDTO";
import type { SystemSettingsRepositoryInterface } from "../../domain/interfaces/SystemSettingsInterfaces";

export class PurgeExpiredLogsUseCase {
  constructor(private readonly repository: SystemSettingsRepositoryInterface) {}

  public async execute(
    dto: PurgeLogsDTO,
    userId?: string,
    ipAddress?: string,
  ): Promise<PurgeResultDTO> {
    if (!dto.confirm) {
      throw new Error("Konfirmasi pembersihan log diperlukan (confirm: true).");
    }

    const entity = await this.repository.getAllSettings();
    const validationCutoff = entity.calculateValidationLogPurgeCutoff();
    const updateCutoff = entity.calculateUpdateLogPurgeCutoff();

    const target = dto.target ?? "ALL";
    return this.repository.purgeExpiredLogs(
      target,
      validationCutoff,
      updateCutoff,
      userId,
      ipAddress,
    );
  }
}
