import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import type { AuthServices } from "@/modules/auth/application/services/AuthServices";
import { AuthController } from "@/modules/auth/infrastructure/http/AuthController";
import { AUTH_COOKIE } from "@/modules/auth/shared/constants/authCookie";

describe("AuthController (Triple A Pattern)", () => {
  let mockLogin: ReturnType<typeof vi.fn>;
  let mockRegister: ReturnType<typeof vi.fn>;
  let mockLogout: ReturnType<typeof vi.fn>;
  let mockValidateAccessToken: ReturnType<typeof vi.fn>;
  let controller: AuthController;

  beforeEach(() => {
    mockLogin = vi.fn();
    mockRegister = vi.fn();
    mockLogout = vi.fn();
    mockValidateAccessToken = vi.fn();

    const mockServices = {
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
      validateAccessToken: mockValidateAccessToken,
    } as unknown as AuthServices;

    controller = new AuthController(mockServices);
  });

  describe("login", () => {
    it("should return HTTP 200 and set auth cookies on successful login", async () => {
      // Arrange
      const payload = { email: "user@example.com", password: "SecurePassword123" };
      const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      mockLogin.mockResolvedValue(
        Result.ok({
          user: {
            id: "usr-1",
            email: "user@example.com",
            name: "John Doe",
            role: "USER" as const,
            isActive: true,
          },
          tokens: {
            accessToken: "access.jwt.token",
            refreshToken: "refresh.jwt.token",
            tokenType: "Bearer",
            expiresIn: 3600,
          },
        }),
      );

      // Act
      const res = await controller.login(req);
      const json = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.user.email).toBe("user@example.com");
      expect(res.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value).toBe("access.jwt.token");
      expect(res.cookies.get(AUTH_COOKIE.REFRESH_TOKEN)?.value).toBe("refresh.jwt.token");
    });

    it("should return HTTP 400 when validation fails", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email", password: "" }),
        headers: { "Content-Type": "application/json" },
      });

      // Act
      const res = await controller.login(req);
      const json = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("should return HTTP 201 on successful registration", async () => {
      // Arrange
      const payload = {
        email: "newuser@example.com",
        password: "SecurePassword123",
        name: "New User",
      };
      const req = new NextRequest("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      mockRegister.mockResolvedValue(
        Result.ok({
          user: {
            id: "usr-2",
            email: "newuser@example.com",
            name: "New User",
            role: "USER" as const,
            isActive: true,
          },
          message: "Registration successful",
        }),
      );

      // Act
      const res = await controller.register(req);
      const json = await res.json();

      // Assert
      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.user.email).toBe("newuser@example.com");
    });
  });

  describe("logout", () => {
    it("should clear auth cookies and return HTTP 200", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/auth/logout", {
        method: "POST",
        headers: {
          cookie: `${AUTH_COOKIE.ACCESS_TOKEN}=active.token; ${AUTH_COOKIE.REFRESH_TOKEN}=refresh.token`,
        },
      });

      mockLogout.mockResolvedValue(Result.ok({ success: true, message: "Logged out" }));

      // Act
      const res = await controller.logout(req);
      const json = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe("validateAccessToken", () => {
    it("should return HTTP 200 with user data for valid token", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/auth/validate-access-token", {
        method: "GET",
        headers: {
          authorization: "Bearer valid.token",
        },
      });

      mockValidateAccessToken.mockResolvedValue(
        Result.ok({
          id: "usr-1",
          email: "user@example.com",
          role: "ADMIN",
          isActive: true,
        }),
      );

      // Act
      const res = await controller.validateAccessToken(req);
      const json = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.email).toBe("user@example.com");
    });
  });
});
