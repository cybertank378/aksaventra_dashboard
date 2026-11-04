import { describe, expect, it } from "vitest";
import { isNextBailoutError } from "../utils/isNextBailoutError";

describe("isNextBailoutError (Triple A Pattern)", () => {
  it("should return false for null, undefined, and non-object inputs", () => {
    // Arrange & Act & Assert
    expect(isNextBailoutError(null)).toBe(false);
    expect(isNextBailoutError(undefined)).toBe(false);
    expect(isNextBailoutError("some error")).toBe(false);
    expect(isNextBailoutError(12345)).toBe(false);
  });

  it("should return false for regular errors without Next.js digest", () => {
    // Arrange
    const error = new Error("Regular database error");

    // Act
    const result = isNextBailoutError(error);

    // Assert
    expect(result).toBe(false);
  });

  it("should return true for NEXT_PRERENDER_INTERRUPTED digest", () => {
    // Arrange
    const error = new Error("Route needs to bail out of prerendering");
    (error as unknown as { digest: string }).digest = "NEXT_PRERENDER_INTERRUPTED";

    // Act
    const result = isNextBailoutError(error);

    // Assert
    expect(result).toBe(true);
  });

  it("should return true for DYNAMIC_SERVER_USAGE digest", () => {
    // Arrange
    const error = new Error("Dynamic server usage");
    (error as unknown as { digest: string }).digest = "DYNAMIC_SERVER_USAGE";

    // Act
    const result = isNextBailoutError(error);

    // Assert
    expect(result).toBe(true);
  });

  it("should return true for any NEXT_ prefixed digest (e.g. NEXT_REDIRECT, NEXT_NOT_FOUND)", () => {
    // Arrange
    const redirectError = { digest: "NEXT_REDIRECT;replace;/login;307;" };
    const notFoundError = { digest: "NEXT_NOT_FOUND" };

    // Act & Assert
    expect(isNextBailoutError(redirectError)).toBe(true);
    expect(isNextBailoutError(notFoundError)).toBe(true);
  });
});
