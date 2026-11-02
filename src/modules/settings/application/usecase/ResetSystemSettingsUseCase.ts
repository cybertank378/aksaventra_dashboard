import type { ResetCategoryDTO } from "../../domain/dto/SystemSettingsRequestDTO";
import type { SystemSettingsResponseDTO } from "../../domain/dto/SystemSettingsResponseDTO";
import type {
  EnvironmentDiagnosticsProviderInterface,
  SystemSettingsRepositoryInterface,
} from "../../domain/interfaces/SystemSettingsInterfaces";

export class ResetSystemSettingsUseCase {
  constructor(
    private readonly repository: SystemSettingsRepositoryInterface,
    private readonly diagnosticsProvider: EnvironmentDiagnosticsProviderInterface,
  ) {}

  public async execute(
    dto: ResetCategoryDTO,
    userId?: string,
    ipAddress?: string,
  ): Promise<SystemSettingsResponseDTO> {
    const entity = await this.repository.getAllSettings();
    const diffs = entity.resetCategory(dto.category);

    if (diffs.length > 0) {
      await this.repository.resetSettings(dto.category, diffs, userId, ipAddress);
    }

    const diagnostics = await this.diagnosticsProvider.getDiagnostics();
    return entity.toDTO(diagnostics);
  }
}
