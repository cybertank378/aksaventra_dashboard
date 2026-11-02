import type { NextRequest } from "next/server";
import { createEngineMonitorController } from "@/app/api/v1/engine/_factory";

export async function GET(request: NextRequest) {
  const controller = createEngineMonitorController();
  return controller.getSummary(request);
}
