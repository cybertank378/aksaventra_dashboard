import type { NextRequest } from "next/server";
import { buildUserAdminController } from "@/app/api/v1/users/_factory";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const controller = buildUserAdminController();
  return controller.getDetail(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const controller = buildUserAdminController();
  return controller.update(req, context);
}
