import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  FileStorageInterface,
  StoredFileResult,
} from "@/core/application/ports/FileStorageInterface";

export class LocalFileStorageService implements FileStorageInterface {
  private readonly baseUploadDir: string;
  private readonly publicUrlPrefix: string;

  constructor(
    baseUploadDir = path.join(process.cwd(), "public", "uploads"),
    publicUrlPrefix = "/uploads",
  ) {
    this.baseUploadDir = baseUploadDir;
    this.publicUrlPrefix = publicUrlPrefix;
  }

  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async upload(
    file: Buffer | Uint8Array,
    filename: string,
    mimeType: string,
    destinationSubDir = "",
  ): Promise<StoredFileResult> {
    const fileId = crypto.randomUUID();
    const ext = path.extname(filename);
    const sanitizedFilename = `${fileId}${ext}`;
    const targetDir = path.join(this.baseUploadDir, destinationSubDir);
    await this.ensureDir(targetDir);

    const fullPath = path.join(targetDir, sanitizedFilename);
    await fs.writeFile(fullPath, file);

    const relativePath = path.join(destinationSubDir, sanitizedFilename).replace(/\\/g, "/");
    const url = `${this.publicUrlPrefix}/${relativePath}`;

    return {
      fileId,
      filename,
      path: fullPath,
      url,
      sizeBytes: file.byteLength,
      mimeType,
      createdAt: new Date(),
    };
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(filePath: string): Promise<string> {
    const relative = path.relative(this.baseUploadDir, filePath).replace(/\\/g, "/");
    return `${this.publicUrlPrefix}/${relative}`;
  }

  async download(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }
}
