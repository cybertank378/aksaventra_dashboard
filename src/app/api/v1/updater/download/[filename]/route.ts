import type { NextRequest } from "next/server";
import { buildUpdaterController } from "@/app/api/v1/updater/_factory";

const controller = buildUpdaterController();

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  return controller.downloadBinary(req, filename);
}
