import type { NextRequest } from "next/server";
import { createEngineMonitorController } from "@/app/api/v1/engine/_factory";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const controller = createEngineMonitorController();
  return controller.patchStatus(request, context);
}
