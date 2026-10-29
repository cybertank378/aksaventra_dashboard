/* ============================================================
 * RELEASE ADMIN CONTROLLER
 * ============================================================
 *
 * Responsibility:
 * - Admin REST API Controller for managing engine releases
 * - Handling multipart file uploads, SHA-256 calculation, and logs
 * ============================================================
 */

import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import type { ReleaseServices } from "@/modules/releases/application/services/ReleaseServices";
import type { StorageProviderInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import { ReleaseValidator } from "@/modules/releases/infrastructure/validators/release.validator";

export class ReleaseAdminController extends BaseController {
  constructor(
    private readonly releaseServices: ReleaseServices,
    private readonly storageProvider?: StorageProviderInterface,
  ) {
    super();
  }

  /* ==========================================================
   * LIST RELEASES (GET /api/v1/releases)
   * ======================================================== */

  public async list(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const channel = url.searchParams.get("channel") ?? undefined;
      const isActiveParam = url.searchParams.get("isActive");
      const isActive = isActiveParam !== null ? isActiveParam === "true" : undefined;
      const search = url.searchParams.get("search") ?? undefined;
      const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
      const limit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);

      const result = await this.releaseServices.listReleases({
        channel,
        isActive,
        search,
        page,
        limit,
      });

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ReleaseAdminController] list error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * CREATE RELEASE (POST /api/v1/releases)
   * ======================================================== */

  public async create(req: NextRequest): Promise<NextResponse> {
    try {
      const contentType = req.headers.get("content-type") ?? "";
      let rawData: Record<string, unknown> = {};

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        let filePath: string | undefined;
        let checksumSha256 = (formData.get("checksumSha256") as string) || "";
        let fileSize = Number(formData.get("fileSize") ?? 0);

        if (file && this.storageProvider) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const saved = await this.storageProvider.saveFile(file.name, buffer);
          filePath = saved.filePath;
          checksumSha256 = saved.checksumSha256;
          fileSize = Number(saved.fileSize);
        }

        rawData = {
          version: formData.get("version"),
          channel: formData.get("channel") ?? "STABLE",
          minSupportedVersion: formData.get("minSupportedVersion") || null,
          mandatory: formData.get("mandatory") === "true",
          releaseNotes: formData.get("releaseNotes") || null,
          filePath,
          checksumSha256,
          fileSize,
          isActive: formData.get("isActive") !== "false",
        };
      } else {
        rawData = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      }

      const validation = ReleaseValidator.validateCreateRelease(rawData);
      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            message: Object.values(validation.errors)[0] ?? "Data rilis tidak valid",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const result = await this.releaseServices.createRelease(validation.data);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 201 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ReleaseAdminController] create error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * TOGGLE RELEASE STATUS (PATCH /api/v1/releases/:id)
   * ======================================================== */

  public async toggle(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json().catch(() => ({}));
      const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

      const result = await this.releaseServices.toggleReleaseStatus({ id, isActive });
      if (result.isSuccess) {
        return NextResponse.json({ success: true, isActive: result.getValue() }, { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ReleaseAdminController] toggle error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * DELETE RELEASE (DELETE /api/v1/releases/:id)
   * ======================================================== */

  public async delete(_req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const result = await this.releaseServices.deleteRelease({ id });
      if (result.isSuccess) {
        return NextResponse.json({ success: true }, { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ReleaseAdminController] delete error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * STATS (GET /api/v1/releases/stats)
   * ======================================================== */

  public async getStats(): Promise<NextResponse> {
    try {
      const result = await this.releaseServices.getReleaseStats();
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ReleaseAdminController] getStats error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * UPDATE LOGS (GET /api/v1/releases/logs)
   * ======================================================== */

  public async getLogs(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const action = url.searchParams.get("action") ?? undefined;
      const channel = url.searchParams.get("channel") ?? undefined;
      const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
      const limit = Number.parseInt(url.searchParams.get("limit") ?? "20", 10);

      const result = await this.releaseServices.getUpdateLogs({
        action,
        channel,
        page,
        limit,
      });

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ReleaseAdminController] getLogs error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  protected async handle(): Promise<NextResponse> {
    return NextResponse.json({ status: "ok" });
  }
}
