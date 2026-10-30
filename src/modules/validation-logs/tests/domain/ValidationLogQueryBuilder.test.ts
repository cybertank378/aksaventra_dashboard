import { describe, expect, it } from "vitest";
import { ValidationLogQueryBuilder } from "../../domain/builders/ValidationLogQueryBuilder";

describe("ValidationLogQueryBuilder (Triple A Pattern)", () => {
  it("should return empty where clause for empty params or ALL group", () => {
    // Arrange & Act
    const whereEmpty = ValidationLogQueryBuilder.buildWhereClause({});
    const whereAll = ValidationLogQueryBuilder.buildWhereClause({ group: "ALL" });

    // Assert
    expect(whereEmpty).toEqual({});
    expect(whereAll).toEqual({});
  });

  it("should map SUCCESS group to ACTIVATED and VERIFIED results", () => {
    // Arrange & Act
    const where = ValidationLogQueryBuilder.buildWhereClause({ group: "SUCCESS" });

    // Assert
    expect(where.result).toEqual({ in: ["ACTIVATED", "VERIFIED"] });
  });

  it("should map MISMATCH group to HWID_MISMATCH", () => {
    // Arrange & Act
    const where = ValidationLogQueryBuilder.buildWhereClause({ group: "MISMATCH" });

    // Assert
    expect(where.result).toBe("HWID_MISMATCH");
  });

  it("should map REJECTED group to EXPIRED, SUSPENDED, NOT_FOUND, BAD_REQUEST", () => {
    // Arrange & Act
    const where = ValidationLogQueryBuilder.buildWhereClause({ group: "REJECTED" });

    // Assert
    expect(where.result).toEqual({ in: ["EXPIRED", "SUSPENDED", "NOT_FOUND", "BAD_REQUEST"] });
  });

  it("should prioritize explicit result over group", () => {
    // Arrange & Act
    const where = ValidationLogQueryBuilder.buildWhereClause({
      group: "SUCCESS",
      result: "HWID_MISMATCH",
    });

    // Assert
    expect(where.result).toBe("HWID_MISMATCH");
  });

  it("should build search clause across hint, clientIp, and clientName", () => {
    // Arrange & Act
    const where = ValidationLogQueryBuilder.buildWhereClause({ search: "test-user" });

    // Assert
    expect(where.OR).toBeDefined();
    expect(where.OR?.length).toBe(3);
    expect(where.OR?.[0]).toEqual({
      serialKeyHint: { contains: "test-user", mode: "insensitive" },
    });
    expect(where.OR?.[1]).toEqual({ clientIp: { contains: "test-user", mode: "insensitive" } });
    expect(where.OR?.[2]).toEqual({
      license: { clientName: { contains: "test-user", mode: "insensitive" } },
    });
  });

  it("should filter by engineVersion and date ranges", () => {
    // Arrange
    const startDate = "2026-10-01T00:00:00Z";
    const endDate = "2026-10-30T00:00:00Z";

    // Act
    const where = ValidationLogQueryBuilder.buildWhereClause({
      engineVersion: "v2.2.2",
      startDate,
      endDate,
    });

    // Assert
    expect(where.engineVersion).toBe("v2.2.2");
    expect(where.checkedAt).toEqual({
      gte: new Date(startDate),
      lte: new Date(endDate),
    });
  });
});
