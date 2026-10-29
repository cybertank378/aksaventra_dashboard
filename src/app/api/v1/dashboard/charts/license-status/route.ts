import type { NextRequest } from "next/server";
import { buildDashboardController } from "@/app/api/v1/dashboard/_factory";

const controller = buildDashboardController();

export async function GET(req: NextRequest) {
  return controller.getLicenseStatusDistribution(req);
}
