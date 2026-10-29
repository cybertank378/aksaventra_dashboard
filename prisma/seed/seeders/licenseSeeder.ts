import type { PrismaClient } from "@prisma/client";
import { LICENSE_SEED_ITEMS } from "../data/licenses.data.ts";
import { seedLogger } from "../logs/seedLogger.ts";

export interface LicenseSeedResult {
  id: string;
  serialKey: string;
  clientName: string;
  status: string;
}

export async function seedLicenses(prisma: PrismaClient): Promise<LicenseSeedResult[]> {
  const results: LicenseSeedResult[] = [];
  const now = Date.now();

  seedLogger.info(`Memulai proses seeding ${LICENSE_SEED_ITEMS.length} data lisensi...`);

  for (const item of LICENSE_SEED_ITEMS) {
    const expiresAt = new Date(now + item.expiresInDays * 24 * 60 * 60 * 1000);
    const createdAt = new Date(now - (item.createdDaysAgo ?? 10) * 24 * 60 * 60 * 1000);
    const activatedAt = item.hwid
      ? new Date(now - (item.activatedDaysAgo ?? 7) * 24 * 60 * 60 * 1000)
      : null;

    const upserted = await prisma.license.upsert({
      where: { serialKey: item.serialKey },
      update: {
        clientName: item.clientName,
        hwid: item.hwid,
        vaultSecret: item.vaultSecret,
        status: item.status,
        engineVersion: item.engineVersion,
        expiresAt,
        activatedAt,
        lastVerifiedAt: activatedAt,
        createdAt,
      },
      create: {
        serialKey: item.serialKey,
        clientName: item.clientName,
        hwid: item.hwid,
        vaultSecret: item.vaultSecret,
        status: item.status,
        engineVersion: item.engineVersion,
        expiresAt,
        activatedAt,
        lastVerifiedAt: activatedAt,
        createdAt,
      },
    });

    seedLogger.success(
      `[SEEDED] Lisensi ${upserted.serialKey} (${upserted.clientName}) | Status: ${upserted.status}`,
    );

    results.push({
      id: upserted.id,
      serialKey: upserted.serialKey,
      clientName: upserted.clientName,
      status: upserted.status,
    });
  }

  return results;
}
