import { describe, expect, it } from "vitest";
import { getSidebarMenu } from "@/security/sidebar/getSidebarMenu";

describe("getSidebarMenu (Triple A Pattern — Hybrid Structure)", () => {
  it("should return 2 streamlined groups and 7 navigation items for ADMIN role", () => {
    // Arrange
    const role = "ADMIN";

    // Act
    const groups = getSidebarMenu(role);
    const allPaths = groups.flatMap((group) => group.items.map((item) => item.path));

    // Assert
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.label)).toEqual(["Menu Navigasi Utama", "Sistem & Administrasi"]);
    expect(allPaths).toEqual([
      "/dashboard",
      "/dashboard/licenses",
      "/dashboard/licenses/devices",
      "/dashboard/engine/monitor",
      "/dashboard/logs/validations",
      "/dashboard/users",
      "/dashboard/settings",
    ]);
  });

  it("should filter sidebar menu for OPERATOR role (5 operational items, excluding Sistem & Administrasi)", () => {
    // Arrange
    const role = "OPERATOR";

    // Act
    const groups = getSidebarMenu(role);
    const allPaths = groups.flatMap((group) => group.items.map((item) => item.path));

    // Assert
    expect(groups).toHaveLength(1);
    expect(groups.map((g) => g.label)).toEqual(["Menu Navigasi Utama"]);
    expect(allPaths).toEqual([
      "/dashboard",
      "/dashboard/licenses",
      "/dashboard/licenses/devices",
      "/dashboard/engine/monitor",
      "/dashboard/logs/validations",
    ]);
  });

  it("should filter sidebar menu for AUDITOR role (read-only overview, licenses, and activity logs)", () => {
    // Arrange
    const role = "AUDITOR";

    // Act
    const groups = getSidebarMenu(role);
    const allPaths = groups.flatMap((group) => group.items.map((item) => item.path));

    // Assert
    expect(groups).toHaveLength(1);
    expect(groups.map((g) => g.label)).toEqual(["Menu Navigasi Utama"]);
    expect(allPaths).toEqual(["/dashboard", "/dashboard/licenses", "/dashboard/logs/validations"]);
  });
});
