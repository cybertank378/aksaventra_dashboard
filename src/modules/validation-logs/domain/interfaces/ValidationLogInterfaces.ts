import type {
  ExportValidationLogsQueryDTO,
  ListValidationLogsQueryDTO,
} from "../dto/ValidationLogRequestDTO";
import type { ValidationLogStatsDTO } from "../dto/ValidationLogResponseDTO";
import type { ValidationLogReadEntity } from "../entity/ValidationLogReadEntity";

export interface ValidationLogWithLicenseDetail {
  log: ValidationLogReadEntity;
  license?: {
    id: string;
    serialKeyHint: string;
    clientName: string | null;
    status: string;
    expiresAt: Date | null;
    currentHwid: string | null;
  } | null;
}

export interface PruneValidationLogsResult {
  deletedCount: number;
  cutoffDate: Date;
}

export interface ValidationLogRepositoryInterface {
  findManyWithFilter(params: ListValidationLogsQueryDTO): Promise<{
    data: ValidationLogReadEntity[];
    total: number;
  }>;
  getStats24h(): Promise<ValidationLogStatsDTO>;
  findById(id: string): Promise<ValidationLogWithLicenseDetail | null>;
  exportLogs(params: ExportValidationLogsQueryDTO): Promise<ValidationLogReadEntity[]>;
  pruneLogsOlderThan(days: number): Promise<PruneValidationLogsResult>;
}
