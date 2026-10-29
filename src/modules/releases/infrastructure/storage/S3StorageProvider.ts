/* ============================================================
 * S3 STORAGE PROVIDER
 * ============================================================
 *
 * Responsibility:
 * - AWS S3 and S3-compatible (MinIO, Cloudflare R2, Wasabi) storage adapter
 * - Binary file upload with SHA-256 calculation
 * - Presigned URL generation for secure, direct binary downloads
 * - Byte-range streaming support
 * ============================================================
 */

import { createHash } from "node:crypto";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  StorageDownloadStreamResult,
  StorageProviderInterface,
  StorageUploadResult,
} from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export interface S3StorageConfig {
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  publicDomain?: string;
  keyPrefix?: string;
}

export class S3StorageProvider implements StorageProviderInterface {
  public readonly driver: "s3" = "s3";
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicDomain?: string;
  private readonly keyPrefix: string;

  constructor(config?: S3StorageConfig, client?: S3Client) {
    this.bucket = config?.bucket || process.env.AWS_S3_BUCKET || "aksaventra-releases";
    this.publicDomain = config?.publicDomain || process.env.AWS_S3_PUBLIC_DOMAIN;
    this.keyPrefix = config?.keyPrefix ?? "releases/";

    if (client) {
      this.client = client;
    } else {
      const region = config?.region || process.env.AWS_REGION || "ap-southeast-1";
      const accessKeyId = config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
      const endpoint = config?.endpoint || process.env.AWS_S3_ENDPOINT;
      const forcePathStyle =
        config?.forcePathStyle ??
        (process.env.AWS_S3_FORCE_PATH_STYLE === "true" ||
          process.env.AWS_S3_FORCE_PATH_STYLE === "1");

      this.client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        forcePathStyle,
        credentials:
          accessKeyId && secretAccessKey
            ? {
                accessKeyId,
                secretAccessKey,
              }
            : undefined,
      });
    }
  }

  /* ==========================================================
   * SAVE FILE
   * ======================================================== */

  public async saveFile(
    filename: string,
    buffer: Buffer,
    contentType = "application/octet-stream",
  ): Promise<StorageUploadResult> {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${this.keyPrefix}${safeFilename}`;
    const hash = createHash("sha256").update(buffer).digest("hex");

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          sha256: hash,
        },
      }),
    );

    let downloadUrl: string | undefined;
    if (this.publicDomain) {
      const cleanDomain = this.publicDomain.replace(/\/$/, "");
      downloadUrl = `${cleanDomain}/${key}`;
    }

    return {
      filePath: key,
      checksumSha256: hash,
      fileSize: BigInt(buffer.length),
      downloadUrl,
    };
  }

  /* ==========================================================
   * GET PRESIGNED DOWNLOAD URL
   * ======================================================== */

  public async getPresignedDownloadUrl(
    filenameOrKey: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const key = this.normalizeKey(filenameOrKey);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /* ==========================================================
   * GET FILE PATH (S3 Key)
   * ======================================================== */

  public async getFilePath(filename: string): Promise<string | null> {
    const key = this.normalizeKey(filename);
    const exists = await this.fileExists(key);
    return exists ? key : null;
  }

  /* ==========================================================
   * FILE EXISTS
   * ======================================================== */

  public async fileExists(filePathOrKey: string): Promise<boolean> {
    try {
      const key = this.normalizeKey(filePathOrKey);

      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /* ==========================================================
   * GET FILE STREAM
   * ======================================================== */

  public async getFileStream(
    filePathOrKey: string,
    range?: { start: number; end: number },
  ): Promise<StorageDownloadStreamResult | null> {
    try {
      const key = this.normalizeKey(filePathOrKey);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: range ? `bytes=${range.start}-${range.end}` : undefined,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        return null;
      }

      return {
        stream: response.Body as unknown as NodeJS.ReadableStream,
        contentLength: response.ContentLength ?? 0,
        etag: response.ETag?.replace(/"/g, "") ?? "",
        contentType: response.ContentType ?? "application/octet-stream",
      };
    } catch {
      return null;
    }
  }

  /* ==========================================================
   * HELPER: NORMALIZE KEY
   * ======================================================== */

  private normalizeKey(rawKey: string): string {
    const clean = rawKey.replace(/^s3:\/\/[^/]+\//, "");
    if (clean.startsWith(this.keyPrefix)) {
      return clean;
    }
    const safeName = clean.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${this.keyPrefix}${safeName}`;
  }
}
