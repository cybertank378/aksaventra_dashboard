import type { PrismaClient } from "@prisma/client";
import { ADMIN_SEED_USERS } from "../data/adminUsers.data.ts";
import { hashSeedPassword } from "../lib/prismaSeedClient.ts";
import { seedLogger } from "../logs/seedLogger.ts";

export interface AdminSeedResult {
  id: string;
  email: string;
  name: string | null;
  role: string;
  operation: "CREATED" | "UPDATED";
}

/**
 * Menjalankan proses seeding idempoten (upsert) untuk akun Administrator Aksaventra.
 * Jika email sudah terdaftar, memperbarui nama, status aktif, role ADMIN, serta hash Argon2id terbaru.
 */
export async function seedAdminUsers(prisma: PrismaClient): Promise<AdminSeedResult[]> {
  const results: AdminSeedResult[] = [];

  seedLogger.info(`Memulai proses seeding ${ADMIN_SEED_USERS.length} akun Administrator...`);

  for (const userData of ADMIN_SEED_USERS) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
      select: { id: true },
    });

    const passwordHash = await hashSeedPassword(userData.plainPassword);

    const upsertedUser = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: passwordHash,
        role: userData.role,
        isActive: userData.isActive,
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: passwordHash,
        role: userData.role,
        isActive: userData.isActive,
      },
    });

    const operation: "CREATED" | "UPDATED" = existingUser ? "UPDATED" : "CREATED";

    await prisma.auditLog.create({
      data: {
        userId: upsertedUser.id,
        action: existingUser ? "SEED_ADMIN_UPDATED" : "SEED_ADMIN_CREATED",
        target: `User:${upsertedUser.email}`,
        details: JSON.stringify({
          role: upsertedUser.role,
          isActive: upsertedUser.isActive,
          seededAt: new Date().toISOString(),
        }),
        ipAddress: "127.0.0.1",
      },
    });

    seedLogger.success(
      `[${operation}] Akun Admin siap digunakan -> Email: ${upsertedUser.email} | Role: ${upsertedUser.role} | ID: ${upsertedUser.id}`,
    );

    results.push({
      id: upsertedUser.id,
      email: upsertedUser.email,
      name: upsertedUser.name,
      role: upsertedUser.role,
      operation,
    });
  }

  return results;
}
