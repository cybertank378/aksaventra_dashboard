import type { NextRequest } from "next/server";
import { buildLicenseAdminController } from "@/app/api/v1/licenses/_factory";

const controller = buildLicenseAdminController();

export async function GET(req: NextRequest) {
  return controller.getStats(req);
}
