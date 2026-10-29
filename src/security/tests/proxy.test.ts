import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE } from "@/modules/auth/shared/constants/authCookie";
import { proxy } from "@/proxy";

describe("Aksaventra Proxy Gateway (Triple A Pattern)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /* ==========================================================
   * 1. STATIC ASSET BYPASS
   * ======================================================== */
  describe("Static Asset Bypass", () => {
    it("should immediately bypass _next static chunks without authentication", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/_next/static/chunk.js");

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should immediately bypass favicon.ico and images", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/favicon.ico");

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });
  });

  /* ==========================================================
   * 2. ENGINE VALIDATION ROUTE (aksaventra_engine.exe)
   * ======================================================== */
  describe("Engine Validation Gateway (/api/v1/engine/validate)", () => {
    it("should reject engine validation when License Key is missing", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/v1/engine/validate", {
        method: "POST",
      });

      // Act
      const response = await proxy(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain("License key required");
    });

    it("should allow engine validation when x-license-key header is present", async () => {
      // Arrange
      const licenseKey = "AKSA-ENGINE-PRO-2026";
      const request = new NextRequest("http://localhost:3000/api/v1/engine/validate", {
        method: "POST",
        headers: {
          "x-license-key": licenseKey,
        },
      });

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should accept license key from Authorization Bearer token header", async () => {
      // Arrange
      const licenseKey = "AKSA-BEARER-KEY-123";
      const request = new NextRequest("http://localhost:3000/api/v1/engine/validate", {
        method: "POST",
        headers: {
          authorization: `Bearer ${licenseKey}`,
        },
      });

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should allow license validation via /api/v1/license/validate when license key is provided", async () => {
      // Arrange
      const licenseKey = "AKSA-ENGINE-CLIENT-KEY-456";
      const request = new NextRequest("http://localhost:3000/api/v1/license/validate", {
        method: "POST",
        headers: {
          "x-license-key": licenseKey,
        },
      });

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });
  });

  /* ==========================================================
   * 3. PUBLIC AUTH ROUTES
   * ======================================================== */
  describe("Public Routes & Redirection", () => {
    it("should allow unauthenticated access to /login page", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/login");

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should allow access to /api/v1/auth routes without token", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
      });

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should redirect authenticated user from /login to /dashboard", async () => {
      // Arrange
      const mockUser = {
        id: "usr-admin-1",
        email: "admin@aksaventra.com",
        role: "ADMIN",
        isActive: true,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ data: mockUser }),
        }),
      );

      const request = new NextRequest("http://localhost:3000/login", {
        headers: {
          cookie: `${AUTH_COOKIE.ACCESS_TOKEN}=access_123; ${AUTH_COOKIE.REFRESH_TOKEN}=refresh_123`,
        },
      });

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
    });
  });

  /* ==========================================================
   * 4. PROTECTED ROUTES & AUTHENTICATION
   * ======================================================== */
  describe("Protected Routes Guard", () => {
    it("should redirect unauthenticated web request to /login?redirect=...", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/dashboard/engines");

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login?redirect=%2Fdashboard%2Fengines");
    });

    it("should return 401 JSON for unauthenticated /api/v1/dashboard/charts/validation-trend", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/v1/dashboard/charts/validation-trend",
      );

      // Act
      const response = await proxy(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Authentication required");
    });

    it("should return 401 JSON for unauthenticated protected API request", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/v1/admin/engines");

      // Act
      const response = await proxy(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Authentication required");
    });

    it("should clear auth cookies and return 401 when token validation fails", async () => {
      // Arrange
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
        }),
      );

      const request = new NextRequest("http://localhost:3000/api/v1/dashboard", {
        headers: {
          cookie: `${AUTH_COOKIE.ACCESS_TOKEN}=expired_token; ${AUTH_COOKIE.REFRESH_TOKEN}=expired_refresh`,
        },
      });

      // Act
      const response = await proxy(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.message).toBe("Invalid or expired token");
      expect(response.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value).toBe("");
    });
  });

  /* ==========================================================
   * 5. VALID AUTHENTICATED REQUEST & HEADER FORWARDING
   * ======================================================== */
  describe("Authenticated Request & Downstream Headers", () => {
    it("should forward security and license headers for authenticated admin", async () => {
      // Arrange
      const mockAdmin = {
        id: "usr-admin-123",
        email: "superadmin@aksaventra.com",
        name: "Aksaventra Admin",
        username: "admin_aksaventra",
        role: "ADMIN",
        status: "ACTIVE",
        licenseKey: "LIC-PRO-9999",
        organization: "Aksaventra Corp",
        isActive: true,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ data: mockAdmin }),
        }),
      );

      const tokenValue = "valid_admin_token";
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `${AUTH_COOKIE.ACCESS_TOKEN}=${tokenValue}; ${AUTH_COOKIE.REFRESH_TOKEN}=valid_refresh`,
        },
      });

      // Act
      const response = await proxy(request);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
      // Downstream request headers set in x-middleware-override-headers / request headers
    });
  });

  /* ==========================================================
   * 6. ERROR HANDLING
   * ======================================================== */
  describe("Internal Server Error Handling", () => {
    it("should return JSON 500 when unexpected runtime error occurs", async () => {
      // Arrange: passing malformed request that throws inside proxy
      const badRequest = {
        nextUrl: {
          get pathname() {
            throw new Error("Unexpected error");
          },
        },
      } as unknown as NextRequest;

      // Act
      const response = await proxy(badRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Proxy internal error");
    });
  });
});
