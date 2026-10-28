import type { NextRequest } from "next/server";
import { buildLicenseController } from "@/app/api/v1/validate/_factory";

const controller = buildLicenseController();

export async function POST(req: NextRequest) {
  return controller.validate(req);
}
