import { prisma } from "@/core/libs/prisma";
import type { LicenseValidationLogEntity } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";
import type { LicenseValidationLogRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

/**
 * Prisma ORM implementation of LicenseValidationLogRepositoryInterface (FR-06).
 */
export class LicenseValidationLogRepository implements LicenseValidationLogRepositoryInterface {
  public async record(log: LicenseValidationLogEntity): Promise<void> {
    await prisma.licenseValidationLog.create({
      data: {
        id: log.id,
        licenseId: log.licenseId ?? null,
        serialKeyHint: log.serialKeyHint,
        hwidHash: log.hwidHash ?? null,
        result: log.result,
        statusCode: log.statusCode,
        engineVersion: log.engineVersion ?? null,
        clientIp: log.clientIp ?? null,
        userAgent: log.userAgent ?? null,
        latencyMs: log.latencyMs ?? null,
        checkedAt: log.checkedAt,
      },
    });
  }
}
