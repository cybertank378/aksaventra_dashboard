import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "@/modules/releases/infrastructure/storage/LocalStorageProvider";
import { S3StorageProvider } from "@/modules/releases/infrastructure/storage/S3StorageProvider";
import { createStorageProvider } from "@/modules/releases/infrastructure/storage/StorageFactory";

describe("StorageFactory (Triple A Pattern)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return LocalStorageProvider by default when no S3 configuration is present", () => {
    // Arrange
    delete process.env.STORAGE_DRIVER;
    delete process.env.AWS_S3_BUCKET;

    // Act
    const provider = createStorageProvider();

    // Assert
    expect(provider).toBeInstanceOf(LocalStorageProvider);
    expect(provider.driver).toBe("local");
  });

  it("should return S3StorageProvider when STORAGE_DRIVER is explicitly set to 's3'", () => {
    // Arrange
    process.env.STORAGE_DRIVER = "s3";
    process.env.AWS_S3_BUCKET = "aksaventra-releases";

    // Act
    const provider = createStorageProvider();

    // Assert
    expect(provider).toBeInstanceOf(S3StorageProvider);
    expect(provider.driver).toBe("s3");
  });

  it("should return S3StorageProvider when AWS_S3_BUCKET is provided and STORAGE_DRIVER is not 'local'", () => {
    // Arrange
    delete process.env.STORAGE_DRIVER;
    process.env.AWS_S3_BUCKET = "my-custom-bucket";

    // Act
    const provider = createStorageProvider();

    // Assert
    expect(provider).toBeInstanceOf(S3StorageProvider);
    expect(provider.driver).toBe("s3");
  });

  it("should return LocalStorageProvider when STORAGE_DRIVER is 'local' even if AWS_S3_BUCKET is defined", () => {
    // Arrange
    process.env.STORAGE_DRIVER = "local";
    process.env.AWS_S3_BUCKET = "my-custom-bucket";

    // Act
    const provider = createStorageProvider();

    // Assert
    expect(provider).toBeInstanceOf(LocalStorageProvider);
    expect(provider.driver).toBe("local");
  });
});
