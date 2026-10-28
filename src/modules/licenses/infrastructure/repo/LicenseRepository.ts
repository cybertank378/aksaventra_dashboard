import { prisma } from "@/core/libs/prisma";
import type { LicenseEntity } from "../../domain/entity/LicenseEntity";
import type { LicenseRepositoryInterface } from "../../domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "../../domain/mapper/LicenseMapper";

/**
 * Prisma ORM implementation of LicenseRepositoryInterface.
 */
export class LicenseRepository implements LicenseRepositoryInterface {
  public async findBySerialKey(serialKey: string): Promise<LicenseEntity | null> {
    const raw = await prisma.license.findUnique({
      where: { serialKey },
    });

    if (!raw) {
      return null;
    }

    return LicenseMapper.toDomain(raw);
  }

  public async save(license: LicenseEntity): Promise<void> {
    const data = LicenseMapper.toPersistence(license);

    await prisma.license.create({
      data,
    });
  }

  public async update(license: LicenseEntity): Promise<void> {
    const data = LicenseMapper.toPersistence(license);

    await prisma.license.update({
      where: { id: license.id },
      data: {
        hwid: data.hwid,
        status: data.status,
        expiresAt: data.expiresAt,
        activatedAt: data.activatedAt,
        lastVerifiedAt: data.lastVerifiedAt,
        engineVersion: data.engineVersion,
        updatedAt: new Date(),
      },
    });
  }
}
