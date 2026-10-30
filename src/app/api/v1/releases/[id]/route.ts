import type { NextRequest } from "next/server";
import { buildReleaseAdminController } from "@/app/api/v1/releases/_factory";

const controller = buildReleaseAdminController();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.toggle(req, id);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.delete(req, id);
}
