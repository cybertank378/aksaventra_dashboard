import type { NextRequest } from "next/server";
import { createSystemSettingsController } from "../../_factory";

export async function POST(request: NextRequest) {
  const controller = createSystemSettingsController();
  return controller.purgeExpiredLogs(request);
}
