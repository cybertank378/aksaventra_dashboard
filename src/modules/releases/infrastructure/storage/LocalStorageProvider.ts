/* ============================================================
 * LOCAL STORAGE PROVIDER
 * ============================================================
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { StorageProviderInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export class LocalStorageProvider implements StorageProviderInterface {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? join(process.cwd(), "public", "uploads", "releases");
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public async saveFile(
    filename: string,
    buffer: Buffer,
  ): Promise<{ filePath: string; checksumSha256: string; fileSize: bigint }> {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = join(this.baseDir, safeFilename);

    await writeFile(filePath, buffer);

    const hash = createHash("sha256").update(buffer).digest("hex");
    const fileStats = await stat(filePath);

    return {
      filePath,
      checksumSha256: hash,
      fileSize: BigInt(fileStats.size),
    };
  }

  public async getFilePath(filename: string): Promise<string | null> {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = join(this.baseDir, safeFilename);

    if (existsSync(filePath)) {
      return filePath;
    }

    return null;
  }

  public async fileExists(filePath: string): Promise<boolean> {
    return existsSync(filePath);
  }
}
