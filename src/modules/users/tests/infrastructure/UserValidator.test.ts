import { describe, expect, it } from "vitest";
import { UserValidator } from "@/modules/users/infrastructure/validators/user.validator";

describe("User Validators", () => {
  describe("validateListQuery", () => {
    it("should accept valid defaults and parse numbers", () => {
      const parsed = UserValidator.validateListQuery({
        page: "2",
        limit: "25",
        role: "ADMIN",
        accountState: "ACTIVE",
      });

      expect(parsed.isValid).toBe(true);
      expect(parsed.data?.page).toBe(2);
      expect(parsed.data?.limit).toBe(25);
      expect(parsed.data?.role).toBe("ADMIN");
      expect(parsed.data?.accountState).toBe("ACTIVE");
    });
  });

  describe("validateCreateUser", () => {
    it("should validate strong password and email format", () => {
      const valid = UserValidator.validateCreateUser({
        name: "Ahmad Rizky",
        email: "ahmad@aksaventra.com",
        password: "Password123",
        role: "OPERATOR",
      });
      expect(valid.isValid).toBe(true);

      const weakPass = UserValidator.validateCreateUser({
        name: "Ahmad Rizky",
        email: "ahmad@aksaventra.com",
        password: "weak",
        role: "OPERATOR",
      });
      expect(weakPass.isValid).toBe(false);
      expect(weakPass.errors.password).toBeDefined();
    });
  });

  describe("validateUpdateUser", () => {
    it("should reject completely empty update requests", () => {
      const result = UserValidator.validateUpdateUser({});
      expect(result.isValid).toBe(false);
      expect(result.errors.general).toBeDefined();
    });

    it("should accept single field update", () => {
      const result = UserValidator.validateUpdateUser({ name: "Updated Name" });
      expect(result.isValid).toBe(true);
      expect(result.data?.name).toBe("Updated Name");
    });
  });

  describe("validateUpdateUserStatus", () => {
    it("should accept unlock flag or isActive flag", () => {
      const result1 = UserValidator.validateUpdateUserStatus({
        isActive: false,
        reason: "Security violation",
      });
      expect(result1.isValid).toBe(true);
      expect(result1.data?.isActive).toBe(false);

      const result2 = UserValidator.validateUpdateUserStatus({ unlock: true });
      expect(result2.isValid).toBe(true);
      expect(result2.data?.unlock).toBe(true);

      const empty = UserValidator.validateUpdateUserStatus({});
      expect(empty.isValid).toBe(false);
    });
  });
});
