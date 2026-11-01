import type { NextRequest } from "next/server";
import { SecurityAuditController } from "@/modules/auth/infrastructure/http/SecurityAuditController";

const controller = new SecurityAuditController();

export async function GET(req: NextRequest) {
  return controller.getAuditLogs(req);
}
