import { describe, expect, it } from "vitest";
import { getAvatarMenuByRole } from "@/security/AvatarMenu";

describe("AvatarMenu (Triple A Pattern)", () => {
  it("should return Profile, Settings, and Security Audit for ADMIN", () => {
    // Arrange
    const role = "ADMIN";

    // Act
    const menu = getAvatarMenuByRole(role);

    // Assert
    expect(menu).toHaveLength(3);
    expect(menu[0].path).toBe("/dashboard/profile");
    expect(menu[1].path).toBe("/dashboard/settings");
    expect(menu[2].path).toBe("/dashboard/security");
  });

  it("should return Profile and Security Audit for OPERATOR (no SETTINGS_MANAGE)", () => {
    // Arrange
    const role = "OPERATOR";

    // Act
    const menu = getAvatarMenuByRole(role);

    // Assert
    expect(menu).toHaveLength(2);
    expect(menu.map((i) => i.path)).toEqual(["/dashboard/profile", "/dashboard/security"]);
  });

  it("should return Profile and Security Audit for AUDITOR", () => {
    // Arrange
    const role = "AUDITOR";

    // Act
    const menu = getAvatarMenuByRole(role);

    // Assert
    expect(menu).toHaveLength(2);
    expect(menu.map((i) => i.path)).toEqual(["/dashboard/profile", "/dashboard/security"]);
  });

  it("should return only Profile for CLIENT", () => {
    // Arrange
    const role = "CLIENT";

    // Act
    const menu = getAvatarMenuByRole(role);

    // Assert
    expect(menu).toHaveLength(1);
    expect(menu[0].path).toBe("/dashboard/profile");
  });

  it("should return only Profile when role is undefined", () => {
    // Arrange & Act
    const menu = getAvatarMenuByRole(undefined);

    // Assert
    expect(menu).toHaveLength(1);
    expect(menu[0].path).toBe("/dashboard/profile");
  });
});
