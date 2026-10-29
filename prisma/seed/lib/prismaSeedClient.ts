import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import pg from "pg";

const { Pool } = pg;

export interface SeedPrismaContext {
  prisma: PrismaClient;
  pool: pg.Pool;
}

/**
 * Membuat instance PrismaClient terisolasi khusus CLI Seeder menggunakan driver adapter @prisma/adapter-pg.
 * Tidak mengimpor "server-only" agar dapat dijalankan langsung melalui Node CLI.
 */
export function createSeedPrismaContext(): SeedPrismaContext {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Variabel environment DATABASE_URL belum dikonfigurasi pada berkas .env. Pastikan koneksi PostgreSQL aktif sebelum menjalankan seeder.",
    );
  }

  const pool = new Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return { prisma, pool };
}

/**
 * Menutup koneksi PrismaClient dan menguras pg.Pool setelah proses seeding selesai.
 */
export async function closeSeedPrismaContext(context: SeedPrismaContext): Promise<void> {
  try {
    await context.prisma.$disconnect();
  } finally {
    await context.pool.end();
  }
}

/**
 * Melakukan hashing kata sandi menggunakan algoritma Argon2id yang identik dengan ArgonProvider
 * pada modul autentikasi utama (memoryCost: 65536, timeCost: 3, parallelism: 4).
 */
export async function hashSeedPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}
