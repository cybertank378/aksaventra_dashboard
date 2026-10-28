import type {
  License as PrismaLicense,
  LicenseStatus as PrismaLicenseStatus,
} from "@prisma/client";
import { LicenseEntity, type LicenseStatus } from "../entity/LicenseEntity";

export class LicenseMapper {
  public static toDomain(record: PrismaLicense): LicenseEntity {
    return LicenseEntity.create({
      id: record.id,
      serialKey: record.serialKey,
      hwid: record.hwid,
      clientName: record.clientName,
      vaultSecret: record.vaultSecret,
      status: record.status as LicenseStatus,
      expiresAt: record.expiresAt,
      activatedAt: record.activatedAt,
      lastVerifiedAt: record.lastVerifiedAt,
      engineVersion: record.engineVersion,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public static toPersistence(entity: LicenseEntity): {
    id: string;
    serialKey: string;
    hwid: string | null;
    clientName: string;
    vaultSecret: string;
    status: PrismaLicenseStatus;
    expiresAt: Date | null;
    activatedAt: Date | null;
    lastVerifiedAt: Date | null;
    engineVersion: string | null;
  } {
    const props = entity.toPrimitives();
    return {
      id: props.id,
      serialKey: props.serialKey,
      hwid: props.hwid ?? null,
      clientName: props.clientName,
      vaultSecret: props.vaultSecret,
      status: props.status as PrismaLicenseStatus,
      expiresAt: props.expiresAt ?? null,
      activatedAt: props.activatedAt ?? null,
      lastVerifiedAt: props.lastVerifiedAt ?? null,
      engineVersion: props.engineVersion ?? null,
    };
  }
}
