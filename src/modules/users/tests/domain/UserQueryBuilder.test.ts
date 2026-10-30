import { describe, expect, it } from "vitest";
import { UserQueryBuilder } from "@/modules/users/domain/builders/UserQueryBuilder";

describe("UserQueryBuilder (Triple A Pattern)", () => {
  it("should build search condition for name and email", () => {
    // Arrange
    const query = { search: "nusantara" };

    // Act
    const where = UserQueryBuilder.buildWhere(query);

    // Assert
    expect(where.AND).toBeDefined();
    expect(where.AND).toEqual(
      expect.arrayContaining([
        {
          OR: [
            { name: { contains: "nusantara", mode: "insensitive" } },
            { email: { contains: "nusantara", mode: "insensitive" } },
          ],
        },
      ]),
    );
  });

  it("should filter by role and active status", () => {
    // Arrange
    const query = { role: "OPERATOR" as const, accountState: "ACTIVE" as const };

    // Act
    const where = UserQueryBuilder.buildWhere(query);

    // Assert
    expect(where.AND).toEqual(expect.arrayContaining([{ role: "OPERATOR" }, { isActive: true }]));
  });
});
