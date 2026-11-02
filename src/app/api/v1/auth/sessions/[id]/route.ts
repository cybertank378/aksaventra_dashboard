import type { NextRequest } from "next/server";
import { ProfileController } from "@/modules/auth/infrastructure/http/ProfileController";

const controller = new ProfileController();

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return controller.revokeSession(req, context);
}
