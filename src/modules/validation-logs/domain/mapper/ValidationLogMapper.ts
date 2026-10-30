import type { ValidationLogItemDTO } from "../dto/ValidationLogResponseDTO";
import type { ValidationLogReadEntity } from "../entity/ValidationLogReadEntity";
import { LatencyThresholdRule } from "../rules/LatencyThresholdRule";

export class ValidationLogMapper {
  public static toItemDTO(entity: ValidationLogReadEntity): ValidationLogItemDTO {
    const hint = entity.serialKeyHint || "••••";
    const serialKeyMasked = `AKSA-••••-••••-${hint}`;

    return {
      id: entity.id,
      licenseId: entity.licenseId,
      clientName: entity.clientName,
      serialKeyMasked,
      serialKeyHint: hint,
      hwidHash: entity.hwidHash,
      result: entity.result,
      statusCode: entity.statusCode,
      engineVersion: entity.engineVersion,
      clientIp: entity.clientIp,
      userAgent: entity.userAgent,
      latencyMs: entity.latencyMs,
      isSlaBreached: LatencyThresholdRule.isSlaBreached(entity.latencyMs),
      checkedAt: entity.checkedAt.toISOString(),
    };
  }

  public static toDTOList(entities: ValidationLogReadEntity[]): ValidationLogItemDTO[] {
    return entities.map((e) => ValidationLogMapper.toItemDTO(e));
  }
}
