import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetRecentActivitiesUseCase } from "@/modules/dashboards/application/usecase/GetRecentActivitiesUseCase";
import { createMockDashboardRepository } from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetRecentActivitiesUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let useCase: GetRecentActivitiesUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    useCase = new GetRecentActivitiesUseCase(mockRepo);
  });

  it("should return mapped activities and fallback to Sistem when user is null", async () => {
    // Arrange
    vi.mocked(mockRepo.findRecentActivities).mockResolvedValue([
      {
        id: "act-1",
        action: "CREATE_LICENSE",
        target: "License:AKSA-1234",
        details: "Lisensi diterbitkan untuk PT Maju",
        createdAt: new Date("2026-10-29T08:00:00Z"),
        user: { name: "Ahmad Admin", email: "admin@aksaventra.ai.id" },
      },
      {
        id: "act-2",
        action: "AUTO_EXPIRE",
        target: "License:AKSA-OLD",
        details: "Lisensi kedaluwarsa otomatis",
        createdAt: new Date("2026-10-29T07:00:00Z"),
        user: null,
      },
    ]);

    // Act
    const result = await useCase.execute({ limit: 5 });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data).toHaveLength(2);
    expect(data[0].actorName).toBe("Ahmad Admin");
    expect(data[1].actorName).toBe("Sistem");
  });
});
