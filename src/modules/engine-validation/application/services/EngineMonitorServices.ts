import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import { GetEngineMonitorSummaryUseCase } from "@/modules/engine-validation/application/usecase/GetEngineMonitorSummaryUseCase";
import { GetLiveValidationFeedUseCase } from "@/modules/engine-validation/application/usecase/GetLiveValidationFeedUseCase";
import { ListBinaryIntegrityRegistryUseCase } from "@/modules/engine-validation/application/usecase/ListBinaryIntegrityRegistryUseCase";
import { UpdateBinaryIntegrityStatusUseCase } from "@/modules/engine-validation/application/usecase/UpdateBinaryIntegrityStatusUseCase";
import { VerifyBinaryChecksumUseCase } from "@/modules/engine-validation/application/usecase/VerifyBinaryChecksumUseCase";
import type {
  LiveFeedQueryDTO,
  PatchBinaryStatusDTO,
  VerifyChecksumRequestDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type {
  BinaryIntegrityItemDTO,
  EngineMonitorSummaryResponseDTO,
  LiveFeedListResponseDTO,
  PatchBinaryStatusResponseDTO,
  VerifyChecksumResponseDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type { EngineMonitorRepositoryInterface } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";

export class EngineMonitorServices extends BaseService {
  private readonly getSummaryUseCase: GetEngineMonitorSummaryUseCase;
  private readonly getLiveFeedUseCase: GetLiveValidationFeedUseCase;
  private readonly listIntegrityUseCase: ListBinaryIntegrityRegistryUseCase;
  private readonly verifyChecksumUseCase: VerifyBinaryChecksumUseCase;
  private readonly updateStatusUseCase: UpdateBinaryIntegrityStatusUseCase;

  constructor(repo: EngineMonitorRepositoryInterface) {
    super("EngineMonitorServices");

    this.getSummaryUseCase = new GetEngineMonitorSummaryUseCase(repo);
    this.getLiveFeedUseCase = new GetLiveValidationFeedUseCase(repo);
    this.listIntegrityUseCase = new ListBinaryIntegrityRegistryUseCase(repo);
    this.verifyChecksumUseCase = new VerifyBinaryChecksumUseCase(repo);
    this.updateStatusUseCase = new UpdateBinaryIntegrityStatusUseCase(repo);
  }

  public async getSummary(): Promise<Result<EngineMonitorSummaryResponseDTO>> {
    return this.getSummaryUseCase.execute();
  }

  public async getLiveFeed(query?: LiveFeedQueryDTO): Promise<Result<LiveFeedListResponseDTO>> {
    return this.getLiveFeedUseCase.execute(query);
  }

  public async listIntegrityRegistry(): Promise<Result<BinaryIntegrityItemDTO[]>> {
    return this.listIntegrityUseCase.execute();
  }

  public async verifyChecksum(
    dto: VerifyChecksumRequestDTO,
  ): Promise<Result<VerifyChecksumResponseDTO>> {
    return this.verifyChecksumUseCase.execute(dto);
  }

  public async updateBinaryStatus(
    dto: PatchBinaryStatusDTO,
    actorId?: string,
  ): Promise<Result<PatchBinaryStatusResponseDTO>> {
    return this.updateStatusUseCase.execute(dto, actorId);
  }
}
