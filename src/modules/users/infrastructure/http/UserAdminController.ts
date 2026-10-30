import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import type { UserServices } from "@/modules/users/application/services/UserServices";
import { UserValidator } from "@/modules/users/infrastructure/validators/user.validator";

export class UserAdminController extends BaseController {
  constructor(private readonly services: UserServices) {
    super();
  }

  protected async handle(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: "UserAdminController active" });
  }

  private extractClientIp(req: NextRequest): string | undefined {
    return (
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-client-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      undefined
    );
  }

  /* ==========================================================
   * LIST USERS (GET /api/v1/users)
   * ======================================================== */
  public async list(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const validation = UserValidator.validateListQuery(url.searchParams);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Parameter query tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.services.listUsers(validation.data);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError().message }, { status: 400 });
    } catch (error) {
      console.error("[UserAdminController.list] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET STATS (GET /api/v1/users/stats)
   * ======================================================== */
  public async getStats(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getStats();
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError().message }, { status: 400 });
    } catch (error) {
      console.error("[UserAdminController.getStats] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET DETAIL (GET /api/v1/users/[id])
   * ======================================================== */
  public async getDetail(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const params = await context.params;
      const { id } = params;

      const result = await this.services.getUserDetail(id);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[UserAdminController.getDetail] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * CREATE USER (POST /api/v1/users)
   * ======================================================== */
  public async create(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const ipAddress = this.extractClientIp(req);

      const body = await req.json();
      const validation = UserValidator.validateCreateUser(body);
      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload pengguna tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.services.createUser(validation.data, auth?.userId, ipAddress);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 201 });
      }

      return NextResponse.json({ message: result.getError().message }, { status: 400 });
    } catch (error) {
      console.error("[UserAdminController.create] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * UPDATE USER (PATCH /api/v1/users/[id])
   * ======================================================== */
  public async update(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const ipAddress = this.extractClientIp(req);
      const params = await context.params;
      const { id } = params;

      const body = await req.json();
      const validation = UserValidator.validateUpdateUser(body);
      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload pembaruan tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.services.updateUser(id, validation.data, auth?.userId, ipAddress);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[UserAdminController.update] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * UPDATE STATUS (PATCH /api/v1/users/[id]/status)
   * ======================================================== */
  public async updateStatus(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const ipAddress = this.extractClientIp(req);
      const params = await context.params;
      const { id } = params;

      const body = await req.json();
      const validation = UserValidator.validateUpdateUserStatus(body);
      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload status tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.services.updateUserStatus(
        id,
        validation.data,
        auth?.userId,
        ipAddress,
      );
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[UserAdminController.updateStatus] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * REVOKE SESSIONS (POST /api/v1/users/[id]/revoke-sessions)
   * ======================================================== */
  public async revokeSessions(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const ipAddress = this.extractClientIp(req);
      const params = await context.params;
      const { id } = params;

      const result = await this.services.revokeUserSessions(id, auth?.userId, ipAddress);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[UserAdminController.revokeSessions] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}
