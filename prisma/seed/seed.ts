import { closeSeedPrismaContext, createSeedPrismaContext } from "./lib/prismaSeedClient.ts";
import { seedLogger } from "./logs/seedLogger.ts";
import { seedAdminUsers } from "./seeders/adminSeeder.ts";
import { seedLicenses } from "./seeders/licenseSeeder.ts";

/**
 * Orkestrator Utama Database Seeder — Aksaventra Engine Validation & License Management System.
 * Struktur modular sesuai pedoman AGENTS.md:
 * - prisma/seed/data/
 * - prisma/seed/lib/
 * - prisma/seed/logs/
 * - prisma/seed/seeders/
 * - prisma/seed/seed.ts
 */
async function runDatabaseSeed(): Promise<void> {
  const startedAt = Date.now();
  seedLogger.info("==========================================================");
  seedLogger.info("Memulai Orkestrator Seeding Database Aksaventra...");
  seedLogger.info("==========================================================");

  const context = createSeedPrismaContext();

  try {
    await context.prisma.$connect();
    seedLogger.info("Koneksi PostgreSQL via @prisma/adapter-pg berhasil terhubung.");

    const seededAdmins = await seedAdminUsers(context.prisma);
    const seededLicenses = await seedLicenses(context.prisma);

    const durationMs = Date.now() - startedAt;
    seedLogger.info("----------------------------------------------------------");
    seedLogger.success(
      `Seluruh proses seeding selesai dalam ${durationMs} ms. Total Admin: ${seededAdmins.length} | Total Lisensi: ${seededLicenses.length}.`,
    );
    seedLogger.info("==========================================================");
  } catch (error) {
    seedLogger.error("Proses seeding database gagal dieksekusi", error);
    process.exitCode = 1;
  } finally {
    await closeSeedPrismaContext(context);
    seedLogger.info("Koneksi pool database PostgreSQL ditutup dengan aman.");
  }
}

await runDatabaseSeed();
