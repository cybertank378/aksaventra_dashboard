import { describe, expect, it } from "vitest";
import { getSidebarMenu } from "@/security/sidebar/getSidebarMenu";

describe("getSidebarMenu (Triple A Pattern)", () => {
  it("should return all 5 domain groups and 11 navigation items for ADMIN role", () => {
    // Arrange
    const role = "ADMIN";

    // Act
    const groups = getSidebarMenu(role);
    const allPaths = groups.flatMap((group) => group.items.map((item) => item.path));

    // Assert
    expect(groups).toHaveLength(5);
    expect(groups.map((g) => g.label)).toEqual([
      "Ikhtisar",
      "Manajemen Lisensi",
      "Engine & Validasi",
      "Audit & Logs",
      "Administrasi",
    ]);
    expect(allPaths).toEqual([
      "/dashboard",
      "/dashboard/licenses",
      "/dashboard/licenses/create",
      "/dashboard/licenses/devices",
      "/dashboard/licenses/revocations",
      "/dashboard/engine/monitor",
      "/dashboard/engine/integrity",
      "/dashboard/logs/validations",
      "/dashboard/logs/audit",
      "/dashboard/users",
      "/dashboard/settings",
    ]);
  });

  it("should filter sidebar menu for OPERATOR role (excluding revocations, integrity, admin audit, and administration)", () => {
    // Arrange
    const role = "OPERATOR";

    // Act
    const groups = getSidebarMenu(role);
    const allPaths = groups.flatMap((group) => group.items.map((item) => item.path));

    // Assert
    expect(groups.map((g) => g.label)).toEqual([
      "Ikhtisar",
      "Manajemen Lisensi",
      "Engine & Validasi",
      "Audit & Logs",
    ]);
    expect(allPaths).toEqual([
      "/dashboard",
      "/dashboard/licenses",
      "/dashboard/licenses/create",
      "/dashboard/licenses/devices",
      "/dashboard/engine/monitor",
      "/dashboard/logs/validations",
    ]);
  });

  it("should filter sidebar menu for AUDITOR role (read-only overview, licenses list, binary integrity, and logs)", () => {
    // Arrange
    const role = "AUDITOR";

    // Act
    const groups = getSidebarMenu(role);
    const allPaths = groups.flatMap((group) => group.items.map((item) => item.path));

    // Assert
    expect(groups.map((g) => g.label)).toEqual([
      "Ikhtisar",
      "Manajemen Lisensi",
      "Engine & Validasi",
      "Audit & Logs",
    ]);
    expect(allPaths).toEqual([
      "/dashboard",
      "/dashboard/licenses",
      "/dashboard/engine/integrity",
      "/dashboard/logs/validations",
      "/dashboard/logs/audit",
    ]);
  });
});
