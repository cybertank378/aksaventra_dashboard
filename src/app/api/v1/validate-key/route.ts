import type { NextRequest } from "next/server";
import { POST as validateHandler } from "@/app/api/v1/validate/route";

export async function POST(req: NextRequest) {
  return validateHandler(req);
}
