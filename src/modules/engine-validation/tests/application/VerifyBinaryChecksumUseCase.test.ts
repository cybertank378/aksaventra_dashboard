import { describe, expect, it, type vi } from "vitest";
import { VerifyBinaryChecksumUseCase } from "@/modules/engine-validation/application/usecase/VerifyBinaryChecksumUseCase";
import {
  createMockEngineMonitorRepository,
  createMockReleaseRecord,
} from "@/modules/engine-validation/tests/mocks/mockEngineMonitorFactories";

describe("VerifyBinaryChecksumUseCase (Triple A Pattern)", () => {
  it("should return VALID when version exists and hash matches exactly", async () => {
    // Arrange
    const activeRelease = createMockReleaseRecord();
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.findBinaryReleaseByVersion as ReturnType<typeof vi.fn>).mockResolvedValue(
      activeRelease,
    );
    const useCase = new VerifyBinaryChecksumUseCase(mockRepo);

    // Act
    const result = await useCase.execute({
      version: activeRelease.version,
      sha256Hash: activeRelease.checksumSha256,
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const verification = result.getValue();
    expect(verification.outcome).toBe("VALID");
    expect(verification.isTrusted).toBe(true);
    expect(verification.version).toBe(activeRelease.version);
    expect(verification.expectedHash).toBe(activeRelease.checksumSha256);
  });

  it("should return HASH_MISMATCH when version exists but provided hash is incorrect", async () => {
    // Arrange
    const activeRelease = createMockReleaseRecord();
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.findBinaryReleaseByVersion as ReturnType<typeof vi.fn>).mockResolvedValue(
      activeRelease,
    );
    const useCase = new VerifyBinaryChecksumUseCase(mockRepo);

    // Act
    const result = await useCase.execute({
      version: activeRelease.version,
      sha256Hash: "invalid000000000000000000000000000000000000000000000000000000000",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const verification = result.getValue();
    expect(verification.outcome).toBe("HASH_MISMATCH");
    expect(verification.isTrusted).toBe(false);
  });

  it("should return UNKNOWN_VERSION when version is not found in database", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.findBinaryReleaseByVersion as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const useCase = new VerifyBinaryChecksumUseCase(mockRepo);

    // Act
    const result = await useCase.execute({
      version: "v99.9.9",
      sha256Hash: "any-hash-value-123456",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const verification = result.getValue();
    expect(verification.outcome).toBe("UNKNOWN_VERSION");
    expect(verification.isTrusted).toBe(false);
  });
});
