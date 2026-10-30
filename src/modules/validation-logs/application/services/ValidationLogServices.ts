import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type {
  ExportValidationLogsQueryDTO,
  ListValidationLogsQueryDTO,
} from "../../domain/dto/ValidationLogRequestDTO";
import type {
  ValidationLogDetailResponseDTO,
  ValidationLogListResponseDTO,
  ValidationLogStatsDTO,
} from "../../domain/dto/ValidationLogResponseDTO";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";
import {
  type ExportValidationLogsResult,
  ExportValidationLogsUseCase,
} from "../usecase/ExportValidationLogsUseCase";
import { GetValidationLogDetailUseCase } from "../usecase/GetValidationLogDetailUseCase";
import { GetValidationLogStatsUseCase } from "../usecase/GetValidationLogStatsUseCase";
import { ListValidationLogsUseCase } from "../usecase/ListValidationLogsUseCase";

export class ValidationLogServices extends BaseService {
  private readonly listUseCase: ListValidationLogsUseCase;
  private readonly getStatsUseCase: GetValidationLogStatsUseCase;
  private readonly getDetailUseCase: GetValidationLogDetailUseCase;
  private readonly exportUseCase: ExportValidationLogsUseCase;

  constructor(repo: ValidationLogRepositoryInterface) {
    super("ValidationLogServices");
    this.listUseCase = new ListValidationLogsUseCase(repo);
    this.getStatsUseCase = new GetValidationLogStatsUseCase(repo);
    this.getDetailUseCase = new GetValidationLogDetailUseCase(repo);
    this.exportUseCase = new ExportValidationLogsUseCase(repo);
  }

  public async listLogs(
    params: ListValidationLogsQueryDTO,
  ): Promise<Result<ValidationLogListResponseDTO, string>> {
    return this.execute(() => this.listUseCase.execute(params));
  }

  public async getStats(): Promise<Result<ValidationLogStatsDTO, string>> {
    return this.execute(() => this.getStatsUseCase.execute());
  }

  public async getDetail(id: string): Promise<Result<ValidationLogDetailResponseDTO, string>> {
    return this.execute(() => this.getDetailUseCase.execute({ id }));
  }

  public async exportLogs(
    params: ExportValidationLogsQueryDTO,
  ): Promise<Result<ExportValidationLogsResult, string>> {
    return this.execute(() => this.exportUseCase.execute(params));
  }
}
