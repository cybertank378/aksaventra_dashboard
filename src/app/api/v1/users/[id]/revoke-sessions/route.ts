import type { NextRequest } from "next/server";
import { buildUserAdminController } from "@/app/api/v1/users/_factory";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const controller = buildUserAdminController();
  return controller.revokeSessions(req, context);
}
