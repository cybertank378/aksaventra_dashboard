import { describe, expect, it } from "vitest";
import { ValidationLogValidator } from "../../infrastructure/validators/validationLog.validator";

describe("ValidationLogValidator (Triple A Pattern)", () => {
  describe("validateListQuery", () => {
    it("should accept valid query parameters and set defaults", () => {
      // Arrange & Act
      const res = ValidationLogValidator.validateListQuery({
        page: "2",
        limit: "25",
        group: "SUCCESS",
        search: "nusan",
      });

      // Assert
      expect(res.isValid).toBe(true);
      expect(res.data?.page).toBe(2);
      expect(res.data?.limit).toBe(25);
      expect(res.data?.group).toBe("SUCCESS");
      expect(res.data?.search).toBe("nusan");
    });

    it("should reject negative or non-numeric page/limit", () => {
      // Arrange & Act
      const resPage = ValidationLogValidator.validateListQuery({ page: "-1" });
      const resLimit = ValidationLogValidator.validateListQuery({ limit: "500" });

      // Assert
      expect(resPage.isValid).toBe(false);
      expect(resPage.errors.page).toBeDefined();

      expect(resLimit.isValid).toBe(false);
      expect(resLimit.errors.limit).toBeDefined();
    });

    it("should reject invalid filter groups and invalid dates", () => {
      // Arrange & Act
      const res = ValidationLogValidator.validateListQuery({
        group: "INVALID_GROUP",
        startDate: "not-a-date",
      });

      // Assert
      expect(res.isValid).toBe(false);
      expect(res.errors.group).toBeDefined();
      expect(res.errors.startDate).toBeDefined();
    });
  });

  describe("validateId", () => {
    it("should validate non-empty string ID", () => {
      // Arrange & Act
      const res = ValidationLogValidator.validateId("abc-123");

      // Assert
      expect(res.isValid).toBe(true);
      expect(res.data?.id).toBe("abc-123");
    });

    it("should reject empty or null ID", () => {
      // Arrange & Act
      const resNull = ValidationLogValidator.validateId(null);
      const resEmpty = ValidationLogValidator.validateId("   ");

      // Assert
      expect(resNull.isValid).toBe(false);
      expect(resEmpty.isValid).toBe(false);
    });
  });
});
