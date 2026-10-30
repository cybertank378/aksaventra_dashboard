import type { PrismaClient } from "@prisma/client";
import { INITIAL_SYSTEM_SETTINGS } from "../data/systemSettings.data.ts";
import { seedLogger } from "../logs/seedLogger.ts";

export async function seedSystemSettings(prisma: PrismaClient): Promise<number> {
  seedLogger.info("Memulai seeding konfigurasi pengaturan sistem (system_settings)...");

  let upsertedCount = 0;

  for (const item of INITIAL_SYSTEM_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: item.key },
      create: {
        key: item.key,
        category: item.category,
        value: item.value,
        valueType: item.valueType,
        description: item.description,
      },
      update: {
        category: item.category,
        valueType: item.valueType,
        description: item.description,
      },
    });

    upsertedCount++;
  }

  seedLogger.success(
    `Seeder pengaturan sistem selesai: ${upsertedCount} konfigurasi berhasil di-upsert secara idempoten.`,
  );
  return upsertedCount;
}
