/* ============================================================
 * STORAGE FACTORY
 * ============================================================
 *
 * Responsibility:
 * - Provide appropriate StorageProviderInterface implementation
 * - Switch between Local Storage and AWS S3 based on environment configuration
 * ============================================================
 */

import type { StorageProviderInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import { LocalStorageProvider } from "@/modules/releases/infrastructure/storage/LocalStorageProvider";
import { S3StorageProvider } from "@/modules/releases/infrastructure/storage/S3StorageProvider";

export function createStorageProvider(): StorageProviderInterface {
  const driver = (process.env.STORAGE_DRIVER || "").toLowerCase();

  // If driver explicitly set to 's3', or if S3 bucket is configured and driver is not set to 'local'
  if (driver === "s3" || (driver !== "local" && Boolean(process.env.AWS_S3_BUCKET))) {
    return new S3StorageProvider();
  }

  return new LocalStorageProvider();
}

export const StorageFactory = {
  create: createStorageProvider,
};
