import type { NextRequest } from "next/server";
import { ProfileController } from "@/modules/auth/infrastructure/http/ProfileController";

const controller = new ProfileController();

export async function GET(req: NextRequest) {
  return controller.getProfile(req);
}

export async function PATCH(req: NextRequest) {
  return controller.patchProfile(req);
}
