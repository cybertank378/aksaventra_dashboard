import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckEngineVersionUseCase } from "@/modules/releases/application/usecase/CheckEngineVersionUseCase";
import { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import type {
  EngineReleaseRepositoryInterface,
  EngineUpdateLogRepositoryInterface,
} from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

describe("CheckEngineVersionUseCase (Triple A Pattern)", () => {
  let mockReleaseRepo: EngineReleaseRepositoryInterface;
  let mockLogRepo: EngineUpdateLogRepositoryInterface;
  let useCase: CheckEngineVersionUseCase;

  beforeEach(() => {
    mockReleaseRepo = {
      findLatestActive: vi.fn(),
      findByVersion: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      incrementDownloadCount: vi.fn(),
      countStats: vi.fn(),
    };

    mockLogRepo = {
      record: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn(),
      countTodayChecks: vi.fn(),
    };

    useCase = new CheckEngineVersionUseCase(mockReleaseRepo, mockLogRepo);
  });

  it("should return has_update: true and mandatory: false when newer release is available", async () => {
    // Arrange
    const publishedAt = new Date("2026-10-25T10:00:00Z");
    const activeRelease = EngineReleaseEntity.create({
      id: "rel-1",
      version: "v2.2.2",
      channel: "STABLE",
      minSupportedVersion: "v2.0.0",
      mandatory: false,
      downloadUrl: "https://aksaventra.ai.id/api/v1/updater/download/aksaventra_engine.exe",
      checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      fileSize: BigInt(12582912),
      releaseNotes: "Pembaruan penanganan lisensi otomatis.",
      isActive: true,
      downloadCount: 42,
      publishedAt,
    });

    vi.mocked(mockReleaseRepo.findLatestActive).mockResolvedValue(activeRelease);

    // Act
    const result = await useCase.execute({
      client_version: "v2.2.1",
      hwid: "1caee749-5928-4c89-a052-ca4f27af8c41",
      serial_key: "AKSA-ENTERPRISE-2026-9F2A",
      channel: "stable",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.status).toBe("success");
    expect(data.has_update).toBe(true);
    expect(data.latest_version).toBe("v2.2.2");
    expect(data.min_supported_version).toBe("v2.0.0");
    expect(data.mandatory).toBe(false);
    expect(data.checksum_sha256).toBe(
      "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    );
    expect(data.release_notes).toBe("Pembaruan penanganan lisensi otomatis.");
    expect(data.published_at).toBe(Math.floor(publishedAt.getTime() / 1000));
    expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
  });

  it("should return mandatory: true when client version is below min_supported_version", async () => {
    // Arrange
    const activeRelease = EngineReleaseEntity.create({
      id: "rel-1",
      version: "v2.2.2",
      channel: "STABLE",
      minSupportedVersion: "v2.1.0",
      mandatory: false,
      checksumSha256: "dummy-hash",
      fileSize: BigInt(1000),
      isActive: true,
      downloadCount: 0,
      publishedAt: new Date(),
    });

    vi.mocked(mockReleaseRepo.findLatestActive).mockResolvedValue(activeRelease);

    // Act
    const result = await useCase.execute({
      client_version: "v2.0.5",
      channel: "stable",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.has_update).toBe(true);
    expect(data.mandatory).toBe(true);
  });

  it("should return has_update: false when client already has latest version", async () => {
    // Arrange
    const activeRelease = EngineReleaseEntity.create({
      id: "rel-1",
      version: "v2.2.2",
      channel: "STABLE",
      minSupportedVersion: "v2.0.0",
      mandatory: false,
      checksumSha256: "dummy-hash",
      fileSize: BigInt(1000),
      isActive: true,
      downloadCount: 0,
      publishedAt: new Date(),
    });

    vi.mocked(mockReleaseRepo.findLatestActive).mockResolvedValue(activeRelease);

    // Act
    const result = await useCase.execute({
      client_version: "v2.2.2",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.has_update).toBe(false);
    expect(data.latest_version).toBe("v2.2.2");
  });

  it("should handle scenario where no active release is registered in database", async () => {
    // Arrange
    vi.mocked(mockReleaseRepo.findLatestActive).mockResolvedValue(null);

    // Act
    const result = await useCase.execute({
      client_version: "v1.0.0",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.has_update).toBe(false);
    expect(data.latest_version).toBe("v1.0.0");
  });
});
