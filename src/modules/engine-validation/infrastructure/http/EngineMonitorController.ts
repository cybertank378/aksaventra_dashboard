import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import type { EngineMonitorServices } from "@/modules/engine-validation/application/services/EngineMonitorServices";
import { EngineMonitorValidator } from "@/modules/engine-validation/infrastructure/validators/engineMonitor.validator";

export class EngineMonitorController extends BaseController {
  constructor(private readonly services: EngineMonitorServices) {
    super();
  }

  protected async handle(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: "EngineMonitorController active" });
  }

  /* ==========================================================
   * GET SUMMARY METRICS (GET /api/v1/engine/monitor/summary)
   * ======================================================== */
  public async getSummary(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getSummary();

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal mengambil ringkasan engine monitor" },
        { status: 500 },
      );
    } catch (error) {
      console.error("[EngineMonitorController.getSummary] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET LIVE FEED (GET /api/v1/engine/monitor/feed)
   * ======================================================== */
  public async getFeed(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const validation = EngineMonitorValidator.validateLiveFeedQuery(url.searchParams);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Parameter query live feed tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.services.getLiveFeed(validation.data);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal mengambil live feed validasi" },
        { status: 400 },
      );
    } catch (error) {
      console.error("[EngineMonitorController.getFeed] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * LIST INTEGRITY REGISTRY (GET /api/v1/engine/integrity)
   * ======================================================== */
  public async listIntegrity(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.listIntegrityRegistry();

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal mengambil daftar integritas biner" },
        { status: 500 },
      );
    } catch (error) {
      console.error("[EngineMonitorController.listIntegrity] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * VERIFY CHECKSUM (POST /api/v1/engine/integrity/verify)
   * ======================================================== */
  public async verifyChecksum(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json().catch(() => null);
      const validation = EngineMonitorValidator.validateVerifyChecksumPayload(body);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload verifikasi checksum tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.services.verifyChecksum(validation.data);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal memverifikasi checksum biner" },
        { status: 400 },
      );
    } catch (error) {
      console.error("[EngineMonitorController.verifyChecksum] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * PATCH BINARY STATUS (PATCH /api/v1/engine/integrity/[id]/status)
   * ======================================================== */
  public async patchStatus(
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      const resolvedParams = "then" in context.params ? await context.params : context.params;
      const releaseId = resolvedParams.id;

      const body = await req.json().catch(() => null);
      const validation = EngineMonitorValidator.validatePatchBinaryStatus(body, releaseId);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: "Payload pembaruan status biner tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const actorId = auth?.userId || req.headers.get("x-auth-user-id") || undefined;
      const result = await this.services.updateBinaryStatus(validation.data, actorId);

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json(
        { message: result.getError() || "Gagal memperbarui status biner" },
        { status: 400 },
      );
    } catch (error) {
      console.error("[EngineMonitorController.patchStatus] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}
