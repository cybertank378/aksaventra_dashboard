import type { NextRequest } from "next/server";
import { createEngineMonitorController } from "@/app/api/v1/engine/_factory";

export async function POST(request: NextRequest) {
  const controller = createEngineMonitorController();
  return controller.verifyChecksum(request);
}
