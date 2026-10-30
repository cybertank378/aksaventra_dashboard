import { describe, expect, it } from "vitest";
import { DashboardQueryBuilder } from "@/modules/dashboards/domain/builders/DashboardQueryBuilder";

describe("DashboardQueryBuilder (Triple A Pattern)", () => {
  it("should default to 30d range, day granularity, and Asia/Jakarta timezone", () => {
    // Arrange & Act
    const query = DashboardQueryBuilder.create().build();

    // Assert
    expect(query.range).toBe("30d");
    expect(query.granularity).toBe("day");
    expect(query.timezone).toBe("Asia/Jakarta");
    expect(query.page).toBe(1);
    expect(query.limit).toBe(5);
    expect(query.offset).toBe(0);
  });

  it("should resolve 7d and 30d to day, and 90d to week granularity", () => {
    const q7d = DashboardQueryBuilder.create().withRange("7d").build();
    const q30d = DashboardQueryBuilder.create().withRange("30d").build();
    const q90d = DashboardQueryBuilder.create().withRange("90d").build();

    expect(q7d.granularity).toBe("day");
    expect(q30d.granularity).toBe("day");
    expect(q90d.granularity).toBe("week");
  });

  it("should allow explicit granularity override", () => {
    const query = DashboardQueryBuilder.create().withRange("90d").withGranularity("month").build();

    expect(query.granularity).toBe("month");
  });

  it("should calculate pagination offsets correctly and clamp limit to 50", () => {
    const query = DashboardQueryBuilder.create().withPagination(3, 10).build();
    expect(query.page).toBe(3);
    expect(query.limit).toBe(10);
    expect(query.offset).toBe(20);

    const clampedQuery = DashboardQueryBuilder.create().withPagination(1, 100).build();
    expect(clampedQuery.limit).toBe(50);
  });
});
