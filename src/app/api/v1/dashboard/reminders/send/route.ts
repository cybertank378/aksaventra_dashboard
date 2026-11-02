import type { NextRequest } from "next/server";
import { buildDashboardController } from "@/app/api/v1/dashboard/_factory";

export async function POST(req: NextRequest) {
  const controller = buildDashboardController();
  return controller.sendRenewalReminders(req);
}
