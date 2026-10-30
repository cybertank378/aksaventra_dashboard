import type { NextRequest } from "next/server";
import { buildReleaseAdminController } from "@/app/api/v1/releases/_factory";

const controller = buildReleaseAdminController();

export async function GET(_req: NextRequest) {
  return controller.getStats();
}
