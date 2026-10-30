import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import { canAccess } from "@/security/fieldGuard";
import type { SystemSettingsServices } from "../../application/services/SystemSettingsServices";
import { SystemSettingsValidator } from "../validators/systemSettings.validator";

export class SystemSettingsController extends BaseController {
  constructor(private readonly services: SystemSettingsServices) {
    super();
  }

  protected async handle(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: "SystemSettingsController active" });
  }

  /* ==========================================================
   * GET ALL SETTINGS & DIAGNOSTICS (GET /api/v1/settings)
   * ======================================================== */
  public async getSettings(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (auth && !canAccess(auth.role, "SETTINGS_MANAGE")) {
        return NextResponse.json(
          { message: "Akses ditolak: Izin SETTINGS_MANAGE diperlukan." },
          { status: 403 },
        );
      }

      const result = await this.services.getSettings();

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal mengambil konfigurasi sistem." },
        { status: 500 },
      );
    } catch (error) {
      console.error("[SystemSettingsController.getSettings] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * PATCH SETTINGS (PATCH /api/v1/settings)
   * ======================================================== */
  public async updateSettings(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (auth && !canAccess(auth.role, "SETTINGS_MANAGE")) {
        return NextResponse.json(
          { message: "Akses ditolak: Izin SETTINGS_MANAGE diperlukan." },
          { status: 403 },
        );
      }

      const body = await req.json().catch(() => null);
      const validation = SystemSettingsValidator.validateUpdate(body);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload pembaruan pengaturan tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const userId = auth?.userId || req.headers.get("x-auth-user-id") || undefined;
      const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

      const result = await this.services.updateSettings(validation.data, userId, ipAddress);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal memperbarui pengaturan sistem." },
        { status: 400 },
      );
    } catch (error) {
      console.error("[SystemSettingsController.updateSettings] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * POST RESET CATEGORY (POST /api/v1/settings/reset)
   * ======================================================== */
  public async resetCategory(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (auth && !canAccess(auth.role, "SETTINGS_MANAGE")) {
        return NextResponse.json(
          { message: "Akses ditolak: Izin SETTINGS_MANAGE diperlukan." },
          { status: 403 },
        );
      }

      const body = await req.json().catch(() => null);
      const validation = SystemSettingsValidator.validateReset(body);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload reset pengaturan tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const userId = auth?.userId || req.headers.get("x-auth-user-id") || undefined;
      const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

      const result = await this.services.resetCategory(validation.data, userId, ipAddress);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal mereset pengaturan sistem." },
        { status: 400 },
      );
    } catch (error) {
      console.error("[SystemSettingsController.resetCategory] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * POST PURGE EXPIRED LOGS (POST /api/v1/settings/maintenance/purge-logs)
   * ======================================================== */
  public async purgeExpiredLogs(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (auth && !canAccess(auth.role, "SETTINGS_MANAGE")) {
        return NextResponse.json(
          { message: "Akses ditolak: Izin SETTINGS_MANAGE diperlukan." },
          { status: 403 },
        );
      }

      const body = await req.json().catch(() => null);
      const validation = SystemSettingsValidator.validatePurge(body);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload pembersihan log tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const userId = auth?.userId || req.headers.get("x-auth-user-id") || undefined;
      const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

      const result = await this.services.purgeExpiredLogs(validation.data, userId, ipAddress);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal membersihkan log lama." },
        { status: 400 },
      );
    } catch (error) {
      console.error("[SystemSettingsController.purgeExpiredLogs] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}
