import type { NextRequest } from "next/server";
import { createSystemSettingsController } from "./_factory";

export async function GET(request: NextRequest) {
  const controller = createSystemSettingsController();
  return controller.getSettings(request);
}

export async function PATCH(request: NextRequest) {
  const controller = createSystemSettingsController();
  return controller.updateSettings(request);
}
