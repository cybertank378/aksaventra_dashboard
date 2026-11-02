import { BaseService } from "@/core/application/BaseService";
import { Result } from "@/core/domain/Result";
import type {
  PurgeLogsDTO,
  ResetCategoryDTO,
  UpdateSystemSettingsDTO,
} from "../../domain/dto/SystemSettingsRequestDTO";
import type {
  PurgeResultDTO,
  SystemSettingsResponseDTO,
} from "../../domain/dto/SystemSettingsResponseDTO";
import type {
  EnvironmentDiagnosticsProviderInterface,
  SystemSettingsRepositoryInterface,
} from "../../domain/interfaces/SystemSettingsInterfaces";
import { GetSystemSettingsUseCase } from "../usecase/GetSystemSettingsUseCase";
import { PurgeExpiredLogsUseCase } from "../usecase/PurgeExpiredLogsUseCase";
import { ResetSystemSettingsUseCase } from "../usecase/ResetSystemSettingsUseCase";
import { UpdateSystemSettingsUseCase } from "../usecase/UpdateSystemSettingsUseCase";

export class SystemSettingsServices extends BaseService {
  private readonly getSettingsUseCase: GetSystemSettingsUseCase;
  private readonly updateSettingsUseCase: UpdateSystemSettingsUseCase;
  private readonly resetSettingsUseCase: ResetSystemSettingsUseCase;
  private readonly purgeLogsUseCase: PurgeExpiredLogsUseCase;

  constructor(
    repo: SystemSettingsRepositoryInterface,
    diagnosticsProvider: EnvironmentDiagnosticsProviderInterface,
  ) {
    super("SystemSettingsServices");

    this.getSettingsUseCase = new GetSystemSettingsUseCase(repo, diagnosticsProvider);
    this.updateSettingsUseCase = new UpdateSystemSettingsUseCase(repo, diagnosticsProvider);
    this.resetSettingsUseCase = new ResetSystemSettingsUseCase(repo, diagnosticsProvider);
    this.purgeLogsUseCase = new PurgeExpiredLogsUseCase(repo);
  }

  public async getSettings(): Promise<Result<SystemSettingsResponseDTO>> {
    try {
      const data = await this.getSettingsUseCase.execute();
      return Result.ok(data);
    } catch (error) {
      this.error("Failed to retrieve system settings", error);
      return Result.fail(
        error instanceof Error ? error.message : "Gagal mengambil pengaturan sistem.",
      );
    }
  }

  public async updateSettings(
    dto: UpdateSystemSettingsDTO,
    userId?: string,
    ipAddress?: string,
  ): Promise<Result<SystemSettingsResponseDTO>> {
    try {
      const data = await this.updateSettingsUseCase.execute(dto, userId, ipAddress);
      return Result.ok(data);
    } catch (error) {
      this.error("Failed to update system settings", error);
      return Result.fail(
        error instanceof Error ? error.message : "Gagal memperbarui pengaturan sistem.",
      );
    }
  }

  public async resetCategory(
    dto: ResetCategoryDTO,
    userId?: string,
    ipAddress?: string,
  ): Promise<Result<SystemSettingsResponseDTO>> {
    try {
      const data = await this.resetSettingsUseCase.execute(dto, userId, ipAddress);
      return Result.ok(data);
    } catch (error) {
      this.error("Failed to reset system settings category", error);
      return Result.fail(
        error instanceof Error ? error.message : "Gagal mereset pengaturan sistem.",
      );
    }
  }

  public async purgeExpiredLogs(
    dto: PurgeLogsDTO,
    userId?: string,
    ipAddress?: string,
  ): Promise<Result<PurgeResultDTO>> {
    try {
      const data = await this.purgeLogsUseCase.execute(dto, userId, ipAddress);
      return Result.ok(data);
    } catch (error) {
      this.error("Failed to purge expired logs", error);
      return Result.fail(error instanceof Error ? error.message : "Gagal membersihkan log lama.");
    }
  }
}
