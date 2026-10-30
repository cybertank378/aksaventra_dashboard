import { describe, expect, it, type vi } from "vitest";
import { UpdateBinaryIntegrityStatusUseCase } from "@/modules/engine-validation/application/usecase/UpdateBinaryIntegrityStatusUseCase";
import {
  createMockEngineMonitorRepository,
  createMockReleaseRecord,
} from "@/modules/engine-validation/tests/mocks/mockEngineMonitorFactories";

describe("UpdateBinaryIntegrityStatusUseCase (Triple A Pattern)", () => {
  it("should update binary active status and record audit log via repository", async () => {
    // Arrange
    const existingRelease = createMockReleaseRecord({ id: "rel-123", isActive: true });
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.findBinaryReleaseById as ReturnType<typeof vi.fn>).mockResolvedValue(existingRelease);
    (mockRepo.updateBinaryStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "rel-123",
      version: existingRelease.version,
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    const useCase = new UpdateBinaryIntegrityStatusUseCase(mockRepo);

    // Act
    const result = await useCase.execute(
      {
        id: "rel-123",
        isActive: false,
        reason: "Security vulnerability mitigation (#39)",
      },
      "admin-user-1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().isActive).toBe(false);
    expect(mockRepo.updateBinaryStatus).toHaveBeenCalledWith(
      {
        id: "rel-123",
        isActive: false,
        reason: "Security vulnerability mitigation (#39)",
      },
      "admin-user-1",
    );
  });

  it("should return failure Result when binary release ID does not exist", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.findBinaryReleaseById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const useCase = new UpdateBinaryIntegrityStatusUseCase(mockRepo);

    // Act
    const result = await useCase.execute({
      id: "non-existent-rel",
      isActive: false,
    });

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError()).toContain("tidak ditemukan");
  });
});
