import type { NextRequest } from "next/server";
import { buildValidationLogController } from "../_factory";

const controller = buildValidationLogController();

export async function POST(req: NextRequest) {
  return controller.prune(req);
}

export async function DELETE(req: NextRequest) {
  return controller.prune(req);
}
