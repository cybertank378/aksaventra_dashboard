import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg, { type PoolConfig } from "pg";

const { Pool } = pg;

interface GlobalPrismaState {
  prisma?: PrismaClient;
  pool?: pg.Pool;
  isShuttingDown?: boolean;
}

const globalForPrisma = globalThis as unknown as {
  __next_moodle_prisma_state__?: GlobalPrismaState;
};

if (!globalForPrisma.__next_moodle_prisma_state__) {
  globalForPrisma.__next_moodle_prisma_state__ = {};
}

const state = globalForPrisma.__next_moodle_prisma_state__;

/**
 * Resolves PostgreSQL connection pool configuration.
 * Configured with strict timeouts and limits to prevent stacked database memory and socket leaks.
 */
function parseBoundedInt(
  val: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!val) return fallback;
  const parsed = Number.parseInt(val, 10);
  if (!Number.isSafeInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function createPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  const max = parseBoundedInt(process.env.PG_POOL_MAX, 10, 1, 100);
  const idleTimeoutMillis = parseBoundedInt(process.env.PG_IDLE_TIMEOUT_MS, 30_000, 1_000, 300_000);
  const connectionTimeoutMillis = parseBoundedInt(
    process.env.PG_CONN_TIMEOUT_MS,
    5_000,
    500,
    60_000,
  );

  return {
    connectionString,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
  };
}

/**
 * Returns the active PostgreSQL connection pool singleton.
 * Lazily instantiates the pool if not already active or if previously closed.
 */
export function getPrismaPool(): pg.Pool {
  if (!state.pool) {
    const config = createPoolConfig();
    state.pool = new Pool(config);

    // Prevent uncaught errors on idle clients from crashing the process
    state.pool.on("error", (err: Error) => {
      console.error("[Prisma:pg.Pool] Unexpected idle client error:", err);
    });
  }

  return state.pool;
}

/**
 * Returns the singleton PrismaClient instance configured with @prisma/adapter-pg.
 * Safe across Fast Refresh/Hot Module Replacement in Next.js development.
 */
export function getPrismaClient(): PrismaClient {
  if (!state.prisma) {
    const pool = getPrismaPool();
    const adapter = new PrismaPg(pool);
    state.prisma = new PrismaClient({ adapter });
  }

  return state.prisma;
}

/**
 * Explicitly establishes connection to PostgreSQL database.
 */
export async function connectPrisma(): Promise<PrismaClient> {
  const client = getPrismaClient();
  await client.$connect();
  return client;
}

/**
 * Gracefully terminates both the Prisma engine connection and the underlying pg.Pool.
 * Flushes all pending pool clients and releases database socket memory.
 */
export async function closePrismaConnection(): Promise<void> {
  if (state.prisma) {
    try {
      await state.prisma.$disconnect();
    } catch (error) {
      console.warn("[Prisma] Error during $disconnect:", error);
    } finally {
      state.prisma = undefined;
    }
  }

  if (state.pool) {
    try {
      await state.pool.end();
    } catch (error) {
      console.warn("[Prisma:pg.Pool] Error during pool.end:", error);
    } finally {
      state.pool = undefined;
    }
  }
}

/**
 * Alias for closePrismaConnection to provide consistent API naming.
 */
export const disconnectPrisma = closePrismaConnection;

/**
 * Helper to execute database operations with the singleton client.
 */
export async function withPrisma<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
  const client = getPrismaClient();
  return await fn(client);
}

/**
 * Scoped execution helper that opens a connection, executes the callback,
 * and guarantees cleanup (close connection & drain pool) in a finally block.
 * Recommended for CLI jobs, migration runners, or isolated tasks to prevent stacked memory.
 */
export async function withIsolatedPrisma<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
  const client = getPrismaClient();
  try {
    return await fn(client);
  } finally {
    await closePrismaConnection();
  }
}

// Graceful process shutdown cleanup
if (typeof process !== "undefined" && typeof process.on === "function" && !state.isShuttingDown) {
  state.isShuttingDown = true;
  const gracefulShutdown = async () => {
    await closePrismaConnection().catch(() => {});
  };

  process.once("SIGINT", gracefulShutdown);
  process.once("SIGTERM", gracefulShutdown);
  process.once("beforeExit", gracefulShutdown);
}

/**
 * Lazy singleton proxy: allows standard `prisma.tenant.findMany()` syntax
 * while ensuring lazy instantiation and transparent recreation after disconnection.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
