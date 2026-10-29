import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AuthTelemetryResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export class GetPortalTelemetryUseCase
  implements BaseUseCase<void, Result<AuthTelemetryResponseDTO, string>>
{
  constructor(private readonly authRepo: AuthRepositoryInterface) {}

  public async execute(): Promise<Result<AuthTelemetryResponseDTO, string>> {
    const telemetry = await this.authRepo.getPortalTelemetry();
    return Result.ok(telemetry);
  }
}
