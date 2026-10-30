import { describe, expect, it } from "vitest";
import { GetLiveValidationFeedUseCase } from "@/modules/engine-validation/application/usecase/GetLiveValidationFeedUseCase";
import type { LiveFeedQueryDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import { createMockEngineMonitorRepository } from "@/modules/engine-validation/tests/mocks/mockEngineMonitorFactories";

describe("GetLiveValidationFeedUseCase (Triple A Pattern)", () => {
  it("should fetch paginated live feed according to query parameters", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const useCase = new GetLiveValidationFeedUseCase(mockRepo);
    const query: LiveFeedQueryDTO = {
      page: 1,
      limit: 20,
      group: "VERIFIED",
      engineVersion: "v2.2.2",
      search: "Nusantara",
    };

    // Act
    const result = await useCase.execute(query);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().items.length).toBe(1);
    expect(mockRepo.getLiveFeed).toHaveBeenCalledWith(query);
  });

  it("should apply default pagination when page or limit is omitted", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const useCase = new GetLiveValidationFeedUseCase(mockRepo);
    const query: LiveFeedQueryDTO = {
      group: "ALL",
    };

    // Act
    const result = await useCase.execute(query);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.getLiveFeed).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
    );
  });
});
