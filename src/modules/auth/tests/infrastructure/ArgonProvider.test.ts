import { describe, expect, it } from "vitest";
import { ArgonProvider } from "@/modules/auth/infrastructure/providers/ArgonProvider";

describe("ArgonProvider with Argon2id (Triple A Pattern)", () => {
  const hasher = new ArgonProvider();

  it("should securely hash a plain password using argon2", async () => {
    // Arrange
    const plainPassword = "SuperSecurePassword123!";

    // Act
    const hash = await hasher.hash(plainPassword);

    // Assert
    expect(hash).toBeDefined();
    expect(hash.startsWith("$argon2")).toBe(true);
  });

  it("should successfully compare plain password with matching argon2 hash", async () => {
    // Arrange
    const plainPassword = "CorrectPassword123#";
    const hash = await hasher.hash(plainPassword);

    // Act
    const isMatch = await hasher.compare(plainPassword, hash);

    // Assert
    expect(isMatch).toBe(true);
  });

  it("should fail comparison for wrong password", async () => {
    // Arrange
    const plainPassword = "CorrectPassword123#";
    const wrongPassword = "WrongPassword456$";
    const hash = await hasher.hash(plainPassword);

    // Act
    const isMatch = await hasher.compare(wrongPassword, hash);

    // Assert
    expect(isMatch).toBe(false);
  });

  it("should handle invalid hash format gracefully without throwing", async () => {
    // Arrange
    const plainPassword = "Password123!";
    const invalidHash = "not-a-valid-argon-hash";

    // Act
    const isMatch = await hasher.compare(plainPassword, invalidHash);

    // Assert
    expect(isMatch).toBe(false);
  });
});
