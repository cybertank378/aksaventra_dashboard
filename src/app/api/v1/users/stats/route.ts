import type { NextRequest } from "next/server";
import { buildUserAdminController } from "@/app/api/v1/users/_factory";

export async function GET(req: NextRequest) {
  const controller = buildUserAdminController();
  return controller.getStats(req);
}
