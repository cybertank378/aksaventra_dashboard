import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetRecentLicensesUseCase } from "@/modules/dashboards/application/usecase/GetRecentLicensesUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetRecentLicensesUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let useCase: GetRecentLicensesUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    useCase = new GetRecentLicensesUseCase(mockRepo, clock);
  });

  it("should return paginated licenses with masked serial keys and hwid status", async () => {
    // Arrange
    vi.mocked(mockRepo.findRecentLicenses).mockResolvedValue({
      items: [
        {
          id: "lic-1",
          serialKey: "AKSA-ENTERPRISE-2026-9F2A",
          clientName: "PT Bintang Jaya",
          status: "ACTIVE",
          hwid: "HWID-1234",
          expiresAt: new Date("2027-10-29T10:00:00Z"),
          engineVersion: "v2.2.1",
          createdAt: new Date("2026-10-20T10:00:00Z"),
        },
      ],
      total: 1,
      statusCounts: {
        ALL: 1,
        ACTIVE: 1,
        EXPIRING_SOON: 0,
        EXPIRED: 0,
        SUSPENDED: 0,
      },
    });

    // Act
    const result = await useCase.execute({ page: 1, limit: 5 });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].serialKeyMasked).toBe("AKSA-••••-••••-9F2A");
    expect(data.items[0].hwidStatus).toBe("BOUND");
    expect(data.items[0].status).toBe("ACTIVE");
    expect(data.total).toBe(1);
    expect(data.totalPages).toBe(1);
  });
});
