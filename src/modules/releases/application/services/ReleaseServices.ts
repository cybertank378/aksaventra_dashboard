import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import { CheckEngineVersionUseCase } from "@/modules/releases/application/usecase/CheckEngineVersionUseCase";
import { CreateReleaseUseCase } from "@/modules/releases/application/usecase/CreateReleaseUseCase";
import { DeleteReleaseUseCase } from "@/modules/releases/application/usecase/DeleteReleaseUseCase";
import { GetLatestReleaseUseCase } from "@/modules/releases/application/usecase/GetLatestReleaseUseCase";
import { GetReleaseStatsUseCase } from "@/modules/releases/application/usecase/GetReleaseStatsUseCase";
import { GetUpdateLogsUseCase } from "@/modules/releases/application/usecase/GetUpdateLogsUseCase";
import { ListReleasesUseCase } from "@/modules/releases/application/usecase/ListReleasesUseCase";
import {
  type RecordDownloadParams,
  RecordDownloadUseCase,
} from "@/modules/releases/application/usecase/RecordDownloadUseCase";
import { ToggleReleaseStatusUseCase } from "@/modules/releases/application/usecase/ToggleReleaseStatusUseCase";
import type {
  CheckVersionRequestDTO,
  CreateReleaseRequestDTO,
  ReleaseQueryDTO,
  UpdateLogQueryDTO,
} from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type {
  CheckVersionResponseDTO,
  ReleaseItemResponseDTO,
  ReleaseListResponseDTO,
  ReleaseStatsResponseDTO,
  UpdateLogListResponseDTO,
} from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import type { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import type {
  EngineReleaseRepositoryInterface,
  EngineUpdateLogRepositoryInterface,
} from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

/* ============================================================
 * RELEASE SERVICE
 * ============================================================
 *
 * Responsibility:
 * - Application Facade
 * - UseCase Orchestrator
 * - Transaction Boundary
 * - Engine Release & Auto-Updater Workflow Coordinator
 * - Thin Application Entry Point
 *
 * NOT:
 * - Business Logic Layer
 * - repo Wrapper
 * - Database Layer
 * ============================================================
 */

export class ReleaseServices extends BaseService {
  //////////////////////////////////////////////////////////////
  // RELEASE USE CASES
  //////////////////////////////////////////////////////////////

  private readonly checkEngineVersionUseCase: CheckEngineVersionUseCase;
  private readonly getLatestReleaseUseCase: GetLatestReleaseUseCase;
  private readonly listReleasesUseCase: ListReleasesUseCase;
  private readonly createReleaseUseCase: CreateReleaseUseCase;
  private readonly toggleReleaseStatusUseCase: ToggleReleaseStatusUseCase;
  private readonly deleteReleaseUseCase: DeleteReleaseUseCase;
  private readonly getReleaseStatsUseCase: GetReleaseStatsUseCase;
  private readonly getUpdateLogsUseCase: GetUpdateLogsUseCase;
  private readonly recordDownloadUseCase: RecordDownloadUseCase;

  //////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  //////////////////////////////////////////////////////////////

  constructor(
    releaseRepo: EngineReleaseRepositoryInterface,
    logRepo: EngineUpdateLogRepositoryInterface,
  ) {
    super("ReleaseService");

    ////////////////////////////////////////////////////////////
    // UPDATER USE CASES
    ////////////////////////////////////////////////////////////

    this.checkEngineVersionUseCase = new CheckEngineVersionUseCase(releaseRepo, logRepo);
    this.getLatestReleaseUseCase = new GetLatestReleaseUseCase(releaseRepo);
    this.recordDownloadUseCase = new RecordDownloadUseCase(releaseRepo, logRepo);

    ////////////////////////////////////////////////////////////
    // MANAGEMENT USE CASES
    ////////////////////////////////////////////////////////////

    this.listReleasesUseCase = new ListReleasesUseCase(releaseRepo);
    this.createReleaseUseCase = new CreateReleaseUseCase(releaseRepo);
    this.toggleReleaseStatusUseCase = new ToggleReleaseStatusUseCase(releaseRepo);
    this.deleteReleaseUseCase = new DeleteReleaseUseCase(releaseRepo);
    this.getReleaseStatsUseCase = new GetReleaseStatsUseCase(releaseRepo, logRepo);
    this.getUpdateLogsUseCase = new GetUpdateLogsUseCase(logRepo);
  }

  /* ==========================================================
   * CHECK ENGINE VERSION
   * ======================================================== */

  checkVersion(request: CheckVersionRequestDTO): Promise<Result<CheckVersionResponseDTO, string>> {
    return this.execute(() => this.checkEngineVersionUseCase.execute(request));
  }

  /* ==========================================================
   * GET LATEST RELEASE
   * ======================================================== */

  getLatestRelease(request: { channel?: string }): Promise<Result<EngineReleaseEntity, string>> {
    return this.execute(() => this.getLatestReleaseUseCase.execute(request));
  }

  /* ==========================================================
   * RECORD DOWNLOAD
   * ======================================================== */

  recordDownload(request: RecordDownloadParams): Promise<Result<boolean, string>> {
    return this.execute(() => this.recordDownloadUseCase.execute(request));
  }

  /* ==========================================================
   * LIST RELEASES
   * ======================================================== */

  listReleases(request: ReleaseQueryDTO): Promise<Result<ReleaseListResponseDTO, string>> {
    return this.execute(() => this.listReleasesUseCase.execute(request));
  }

  /* ==========================================================
   * CREATE RELEASE
   * ======================================================== */

  createRelease(request: CreateReleaseRequestDTO): Promise<Result<ReleaseItemResponseDTO, string>> {
    return this.execute(() => this.createReleaseUseCase.execute(request));
  }

  /* ==========================================================
   * TOGGLE RELEASE STATUS
   * ======================================================== */

  toggleReleaseStatus(request: {
    id: string;
    isActive?: boolean;
  }): Promise<Result<boolean, string>> {
    return this.execute(() => this.toggleReleaseStatusUseCase.execute(request));
  }

  /* ==========================================================
   * DELETE RELEASE
   * ======================================================== */

  deleteRelease(request: { id: string }): Promise<Result<boolean, string>> {
    return this.execute(() => this.deleteReleaseUseCase.execute(request));
  }

  /* ==========================================================
   * GET RELEASE STATS
   * ======================================================== */

  getReleaseStats(): Promise<Result<ReleaseStatsResponseDTO, string>> {
    return this.execute(() => this.getReleaseStatsUseCase.execute());
  }

  /* ==========================================================
   * GET UPDATE LOGS
   * ======================================================== */

  getUpdateLogs(request: UpdateLogQueryDTO): Promise<Result<UpdateLogListResponseDTO, string>> {
    return this.execute(() => this.getUpdateLogsUseCase.execute(request));
  }
}

export { ReleaseServices as ReleaseService };
