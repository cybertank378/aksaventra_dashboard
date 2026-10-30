import type { NextRequest } from "next/server";
import { buildReleaseAdminController } from "@/app/api/v1/releases/_factory";

const controller = buildReleaseAdminController();

export async function GET(req: NextRequest) {
  return controller.list(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
