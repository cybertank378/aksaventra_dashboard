import { prisma } from "@/core/libs/prisma";
import type { LicenseValidationLogEntity } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";
import type {
  LicenseValidationLogRepositoryInterface,
  RawLicenseValidationLogRecord,
} from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

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

  public async findRecentByLicenseId(
    licenseId: string,
    limit = 10,
  ): Promise<RawLicenseValidationLogRecord[]> {
    const raw = await prisma.licenseValidationLog.findMany({
      where: { licenseId },
      orderBy: { checkedAt: "desc" },
      take: limit,
    });

    return raw.map((l) => ({
      id: l.id,
      result: l.result,
      statusCode: l.statusCode,
      hwidHash: l.hwidHash,
      clientIp: l.clientIp,
      engineVersion: l.engineVersion,
      latencyMs: l.latencyMs,
      checkedAt: l.checkedAt,
    }));
  }
}
