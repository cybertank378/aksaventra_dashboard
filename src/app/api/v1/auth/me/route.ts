import type { NextRequest } from "next/server";
import { buildAuthController } from "@/app/api/v1/auth/_factory";

const controller = buildAuthController();

export async function GET(req: NextRequest) {
  return controller.me(req);
}
