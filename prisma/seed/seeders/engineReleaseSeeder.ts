import type { PrismaClient } from "@prisma/client";
import { INITIAL_ENGINE_RELEASES } from "../data/engineReleases.data.ts";
import { seedLogger } from "../logs/seedLogger.ts";

export async function seedEngineReleases(prisma: PrismaClient): Promise<number> {
  seedLogger.info("Memulai seeding rilis biner engine dan log pembaruan...");

  let seededCount = 0;

  for (const item of INITIAL_ENGINE_RELEASES) {
    const existing = await prisma.engineRelease.findUnique({
      where: { version: item.version },
    });

    if (!existing) {
      const release = await prisma.engineRelease.create({
        data: {
          version: item.version,
          channel: item.channel,
          minSupportedVersion: item.minSupportedVersion,
          mandatory: item.mandatory,
          downloadUrl: item.downloadUrl,
          checksumSha256: item.checksumSha256,
          fileSize: item.fileSize,
          releaseNotes: item.releaseNotes,
          isActive: item.isActive,
          downloadCount: item.downloadCount,
          publishedAt: item.publishedAt,
        },
      });

      // Sample update log
      await prisma.engineUpdateLog.create({
        data: {
          releaseId: release.id,
          clientVersion: "v2.2.3",
          hwid: null,
          serialKey: "AKSA-TRIAL-2026-9F2A",
          channel: item.channel.toLowerCase(),
          action: "CHECK",
          status: "SUCCESS",
          clientIp: "127.0.0.1",
          userAgent: "aksaventra_engine/2.2.3",
        },
      });

      seededCount++;
    }
  }

  seedLogger.success(
    `Seeder rilis biner engine selesai: ${seededCount} versi rilis baru ditambahkan.`,
  );
  return seededCount;
}
