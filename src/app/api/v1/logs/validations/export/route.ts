import type { NextRequest } from "next/server";
import { buildValidationLogController } from "../_factory";

const controller = buildValidationLogController();

export async function GET(req: NextRequest) {
  return controller.export(req);
}
