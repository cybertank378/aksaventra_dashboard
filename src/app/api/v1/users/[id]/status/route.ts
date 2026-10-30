import type { NextRequest } from "next/server";
import { buildUserAdminController } from "@/app/api/v1/users/_factory";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const controller = buildUserAdminController();
  return controller.updateStatus(req, context);
}
