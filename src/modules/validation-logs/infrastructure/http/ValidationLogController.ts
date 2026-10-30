import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import type { ValidationLogServices } from "../../application/services/ValidationLogServices";
import { ValidationLogValidator } from "../validators/validationLog.validator";

export class ValidationLogController extends BaseController {
  constructor(private readonly services: ValidationLogServices) {
    super();
  }

  protected async handle(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: "ValidationLogController active" });
  }

  /* ==========================================================
   * LIST VALIDATION LOGS (GET /api/v1/logs/validations)
   * ======================================================== */
  public async list(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });

      const validation = ValidationLogValidator.validateListQuery(queryParams);
      if (!validation.isValid) {
        return NextResponse.json(
          { message: "Parameter query tidak valid", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.services.listLogs(validation.data ?? {});

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ValidationLogController.list] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET STATS (GET /api/v1/logs/validations/stats)
   * ======================================================== */
  public async getStats(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getStats();

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ValidationLogController.getStats] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * GET DETAIL (GET /api/v1/logs/validations/[id])
   * ======================================================== */
  public async getDetail(
    _req: NextRequest,
    params: { id?: string } | Promise<{ id?: string }>,
  ): Promise<NextResponse> {
    try {
      const resolvedParams = await params;
      const validation = ValidationLogValidator.validateId(resolvedParams?.id);

      if (!validation.isValid) {
        return NextResponse.json(
          { message: "ID log tidak valid", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.services.getDetail(validation.data?.id ?? "");

      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }

      const errorMsg = result.getError();
      const status = errorMsg.includes("tidak ditemukan") ? 404 : 400;
      return NextResponse.json({ message: errorMsg }, { status });
    } catch (error) {
      console.error("[ValidationLogController.getDetail] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * EXPORT LOGS (GET /api/v1/logs/validations/export)
   * ======================================================== */
  public async export(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });

      const validation = ValidationLogValidator.validateExportQuery(queryParams);
      if (!validation.isValid) {
        return NextResponse.json(
          { message: "Parameter query ekspor tidak valid", errors: validation.errors },
          { status: 400 },
        );
      }

      const result = await this.services.exportLogs(validation.data ?? {});

      if (result.isSuccess) {
        const { buffer, filename, contentType } = result.getValue();
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ValidationLogController.export] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

  /* ==========================================================
   * PRUNE OLD LOGS (POST/DELETE /api/v1/logs/validations/prune)
   * ======================================================== */
  public async prune(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });

      const body = await req.json().catch(() => ({}));
      const combined = { ...queryParams, ...(body && typeof body === "object" ? body : {}) };

      const validation = ValidationLogValidator.validatePruneQuery(combined);
      if (!validation.isValid) {
        return NextResponse.json(
          { message: "Parameter retensi tidak valid", errors: validation.errors },
          { status: 400 },
        );
      }

      const days = validation.data?.days ?? 90;
      const result = await this.services.pruneLogs(days);

      if (result.isSuccess) {
        const val = result.getValue();
        return NextResponse.json(
          {
            success: true,
            deletedCount: val.deletedCount,
            cutoffDate: val.cutoffDate.toISOString(),
            message: `Berhasil memangkas ${val.deletedCount} log validasi yang lebih lama dari ${days} hari`,
          },
          { status: 200 },
        );
      }

      return NextResponse.json({ message: result.getError() }, { status: 400 });
    } catch (error) {
      console.error("[ValidationLogController.prune] error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}
