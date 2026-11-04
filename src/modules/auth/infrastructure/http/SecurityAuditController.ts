import { type NextRequest, NextResponse } from "next/server";
import { isNextBailoutError } from "@/core/utils/isNextBailoutError";
import { GetSecurityAuditLogsUseCase } from "@/modules/auth/application/usecase/GetSecurityAuditLogsUseCase";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import { canAccess } from "@/security/fieldGuard";

export class SecurityAuditController {
  constructor(
    private readonly getSecurityAuditLogsUseCase: GetSecurityAuditLogsUseCase = new GetSecurityAuditLogsUseCase(),
  ) {}

  public async getAuditLogs(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (!auth) {
        return NextResponse.json(
          { success: false, message: "Tidak terautentikasi" },
          { status: 401 },
        );
      }

      if (!canAccess(auth.role, "LOGS_VIEW")) {
        return NextResponse.json(
          { success: false, message: "Akses ditolak: Anda tidak memiliki izin LOGS_VIEW" },
          { status: 403 },
        );
      }

      const url = new URL(req.url);
      const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
      const limit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
      const search = url.searchParams.get("search") ?? undefined;
      const tabParam = url.searchParams.get("tab");
      const tab = tabParam === "login_audits" ? "login_audits" : "audit_logs";

      const data = await this.getSecurityAuditLogsUseCase.execute({
        page: Number.isNaN(page) ? 1 : page,
        limit: Number.isNaN(limit) ? 10 : limit,
        search,
        tab,
      });

      return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
      if (isNextBailoutError(error)) throw error;
      console.error("[SecurityAuditController.getAuditLogs]", error);
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan internal" },
        { status: 500 },
      );
    }
  }
}
