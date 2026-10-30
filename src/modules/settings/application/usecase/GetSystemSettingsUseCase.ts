import type { SystemSettingsResponseDTO } from "../../domain/dto/SystemSettingsResponseDTO";
import type {
  EnvironmentDiagnosticsProviderInterface,
  SystemSettingsRepositoryInterface,
} from "../../domain/interfaces/SystemSettingsInterfaces";

export class GetSystemSettingsUseCase {
  constructor(
    private readonly repository: SystemSettingsRepositoryInterface,
    private readonly diagnosticsProvider: EnvironmentDiagnosticsProviderInterface,
  ) {}

  public async execute(): Promise<SystemSettingsResponseDTO> {
    const [entity, diagnostics] = await Promise.all([
      this.repository.getAllSettings(),
      this.diagnosticsProvider.getDiagnostics(),
    ]);

    return entity.toDTO(diagnostics);
  }
}
