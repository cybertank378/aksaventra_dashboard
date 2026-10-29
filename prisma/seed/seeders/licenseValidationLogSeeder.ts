import type { PrismaClient } from "@prisma/client";
import { generateValidationLogSeedData } from "../data/licenseValidationLogs.data.ts";
import { seedLogger } from "../logs/seedLogger.ts";

export async function seedLicenseValidationLogs(prisma: PrismaClient): Promise<number> {
  const seedItems = generateValidationLogSeedData();

  seedLogger.info(`Menyiapkan pembersihan dan seeding ${seedItems.length} log validasi engine...`);

  // Idempotency: clean up previous seed records without affecting live engine traffic
  const deleted = await prisma.licenseValidationLog.deleteMany({
    where: {
      id: {
        startsWith: "seed-vlog-",
      },
    },
  });

  if (deleted.count > 0) {
    seedLogger.info(`Membersihkan ${deleted.count} data log validasi lama berawalan 'seed-vlog-'.`);
  }

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  let totalInserted = 0;

  for (let i = 0; i < seedItems.length; i += BATCH_SIZE) {
    const batch = seedItems.slice(i, i + BATCH_SIZE);
    const result = await prisma.licenseValidationLog.createMany({
      data: batch,
      skipDuplicates: true,
    });
    totalInserted += result.count;
  }

  seedLogger.success(
    `[SEEDED] Berhasil menginjeksi ${totalInserted} log validasi mesin 90 hari terakhir.`,
  );

  return totalInserted;
}

