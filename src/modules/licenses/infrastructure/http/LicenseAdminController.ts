import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import type { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseValidator } from "@/modules/licenses/infrastructure/validators/license.validator";

export class LicenseAdminController extends BaseController {
  constructor(private readonly services: LicenseServices) {
    super();
  }

  protected async handle(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: "LicenseAdminController active" });
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
   * LIST LICENSES (GET /api/v1/licenses)
   * ======================================================== */
  public async list(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const url = new URL(req.url);
      const query = LicenseValidator.validateListQuery(url.searchParams);

      const result = await this.services.listLicenses(query, auth?.role);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError().message }, { status: 400 });
    } catch (error) {
      console.error("[LicenseAdminController.list] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET STATS (GET /api/v1/licenses/stats)
   * ======================================================== */
  public async getStats(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getStats();

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError().message }, { status: 400 });
    } catch (error) {
      console.error("[LicenseAdminController.getStats] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET DETAIL (GET /api/v1/licenses/[id])
   * ======================================================== */
  public async getDetail(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const params = await context.params;
      const { id } = params;

      const result = await this.services.getLicenseDetail(id, auth?.role);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[LicenseAdminController.getDetail] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * CREATE LICENSE (POST /api/v1/licenses)
   * ======================================================== */
  public async create(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const body = await req.json().catch(() => null);

      const validation = LicenseValidator.validateCreate(body);
      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          { message: "Payload tidak valid", errors: validation.errors },
          { status: 400 },
        );
      }

      const clientIp = this.extractClientIp(req);
      const result = await this.services.createLicense(
        validation.data,
        auth?.userId,
        clientIp,
        auth?.role,
      );

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 201 });
      }

      return NextResponse.json({ message: result.getError().message }, { status: 400 });
    } catch (error) {
      console.error("[LicenseAdminController.create] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * RESET DEVICE HWID (PATCH /api/v1/licenses/[id]/reset-hwid)
   * ======================================================== */
  public async resetHwid(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const params = await context.params;
      const { id } = params;

      const body = await req.json().catch(() => ({}));
      const validation = LicenseValidator.validateResetHwid(body);

      const clientIp = this.extractClientIp(req);
      const result = await this.services.resetDeviceHwid(
        { id, reason: validation.data?.reason },
        auth?.userId,
        clientIp,
        auth?.role,
      );

      if (result.isSuccess) {
        return NextResponse.json(
          {
            success: true,
            message: "Ikatan perangkat HWID berhasil dilepas",
            license: result.getValue(),
          },
          { status: 200 },
        );
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[LicenseAdminController.resetHwid] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * UPDATE STATUS (PATCH /api/v1/licenses/[id]/status)
   * ======================================================== */
  public async updateStatus(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const params = await context.params;
      const { id } = params;

      const body = await req.json().catch(() => null);
      const validation = LicenseValidator.validateUpdateStatus(body);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          { message: "Payload tidak valid", errors: validation.errors },
          { status: 400 },
        );
      }

      const clientIp = this.extractClientIp(req);
      const result = await this.services.updateLicenseStatus(
        id,
        validation.data,
        auth?.userId,
        clientIp,
        auth?.role,
      );

      if (result.isSuccess) {
        return NextResponse.json(
          {
            success: true,
            message: "Status lisensi berhasil diperbarui",
            license: result.getValue(),
          },
          { status: 200 },
        );
      }

      const errorMessage = result.getError().message;
      const status = errorMessage.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMessage }, { status });
    } catch (error) {
      console.error("[LicenseAdminController.updateStatus] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}
