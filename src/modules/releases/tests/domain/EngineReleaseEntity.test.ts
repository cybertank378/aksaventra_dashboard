import { describe, expect, it } from "vitest";
import { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";

describe("EngineReleaseEntity (Triple A Pattern)", () => {
  it("should detect when an update is available for an older client", () => {
    // Arrange
    const release = EngineReleaseEntity.create({
      id: "rel-1",
      version: "v2.2.2",
      channel: "STABLE",
      minSupportedVersion: "v2.0.0",
      mandatory: false,
      checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      fileSize: BigInt(12582912),
      isActive: true,
      downloadCount: 0,
      publishedAt: new Date(),
    });

    // Act & Assert
    expect(release.hasUpdateFor("v2.2.1")).toBe(true);
    expect(release.hasUpdateFor("v2.2.2")).toBe(false);
    expect(release.hasUpdateFor("v2.2.3")).toBe(false);
  });

  it("should detect mandatory update when client is below minSupportedVersion", () => {
    // Arrange
    const release = EngineReleaseEntity.create({
      id: "rel-2",
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

    // Act & Assert
    expect(release.isMandatoryFor("v2.0.9")).toBe(true);
    expect(release.isMandatoryFor("v2.1.0")).toBe(false);
    expect(release.isMandatoryFor("v2.2.1")).toBe(false);
  });

  it("should return false for update check if release is inactive", () => {
    // Arrange
    const release = EngineReleaseEntity.create({
      id: "rel-3",
      version: "v2.2.2",
      channel: "STABLE",
      mandatory: false,
      checksumSha256: "dummy-hash",
      fileSize: BigInt(1000),
      isActive: false,
      downloadCount: 0,
      publishedAt: new Date(),
    });

    // Act & Assert
    expect(release.hasUpdateFor("v2.1.0")).toBe(false);
  });
});
