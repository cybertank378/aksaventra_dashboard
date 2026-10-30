import { beforeEach, describe, expect, it, vi } from "vitest";
import { S3StorageProvider } from "@/modules/releases/infrastructure/storage/S3StorageProvider";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = mockSend;
    },
    PutObjectCommand: class {
      constructor(public input: Record<string, unknown>) {}
    },
    GetObjectCommand: class {
      constructor(public input: Record<string, unknown>) {}
    },
    HeadObjectCommand: class {
      constructor(public input: Record<string, unknown>) {}
    },
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: vi.fn().mockImplementation(async (_client, command, options) => {
      return `https://s3.amazonaws.com/${command.input.Bucket}/${command.input.Key}?token=signed&expires=${options?.expiresIn ?? 3600}`;
    }),
  };
});

describe("S3StorageProvider (Triple A Pattern)", () => {
  let provider: S3StorageProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new S3StorageProvider({
      bucket: "test-engine-bucket",
      region: "ap-southeast-1",
      publicDomain: "https://releases.aksaventra.ai.id",
    });
  });

  describe("saveFile", () => {
    it("should upload file to S3 and return valid SHA-256 checksum and CDN url", async () => {
      // Arrange
      mockSend.mockResolvedValueOnce({});
      const fileContent = Buffer.from("AKSAVENTRA_BINARY_BYTES_TEST");

      // Act
      const result = await provider.saveFile(
        "aksaventra_engine.exe",
        fileContent,
        "application/octet-stream",
      );

      // Assert
      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input.Bucket).toBe("test-engine-bucket");
      expect(command.input.Key).toBe("releases/aksaventra_engine.exe");
      expect(command.input.ContentType).toBe("application/octet-stream");
      expect(result.filePath).toBe("releases/aksaventra_engine.exe");
      expect(result.fileSize).toBe(BigInt(fileContent.length));
      expect(result.checksumSha256).toHaveLength(64);
      expect(result.downloadUrl).toBe(
        "https://releases.aksaventra.ai.id/releases/aksaventra_engine.exe",
      );
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("should generate a presigned download URL with default expiry", async () => {
      // Arrange
      const filename = "aksaventra_engine.exe";

      // Act
      const url = await provider.getPresignedDownloadUrl(filename, 1800);

      // Assert
      expect(url).toContain(
        "https://s3.amazonaws.com/test-engine-bucket/releases/aksaventra_engine.exe",
      );
      expect(url).toContain("expires=1800");
    });
  });

  describe("fileExists", () => {
    it("should return true when HeadObject succeeds", async () => {
      // Arrange
      mockSend.mockResolvedValueOnce({ ContentLength: 1024 });

      // Act
      const exists = await provider.fileExists("aksaventra_engine.exe");

      // Assert
      expect(exists).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should return false when HeadObject throws error", async () => {
      // Arrange
      mockSend.mockRejectedValueOnce(new Error("NotFound"));

      // Act
      const exists = await provider.fileExists("unknown.exe");

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe("getFileStream", () => {
    it("should return stream result with Range header if provided", async () => {
      // Arrange
      const mockStream = { pipe: vi.fn() };
      mockSend.mockResolvedValueOnce({
        Body: mockStream,
        ContentLength: 500,
        ETag: '"mock-etag"',
        ContentType: "application/octet-stream",
      });

      // Act
      const result = await provider.getFileStream("aksaventra_engine.exe", {
        start: 0,
        end: 499,
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result?.contentLength).toBe(500);
      expect(result?.etag).toBe("mock-etag");
      const command = mockSend.mock.calls[0][0];
      expect(command.input.Range).toBe("bytes=0-499");
    });
  });
});
