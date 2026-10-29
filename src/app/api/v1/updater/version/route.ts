import type { NextRequest } from "next/server";
import { buildUpdaterController } from "@/app/api/v1/updater/_factory";

const controller = buildUpdaterController();

export async function GET(req: NextRequest) {
  return controller.checkVersion(req);
}

export async function POST(req: NextRequest) {
  return controller.checkVersion(req);
}
