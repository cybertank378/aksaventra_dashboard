import type { NextRequest } from "next/server";
import type { SessionDeviceInfo } from "@/modules/auth/domain/types/SessionDeviceInfo";

export class RequestMetadataHelper {
  public static extract(req: NextRequest): SessionDeviceInfo {
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0]?.trim() : "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    return {
      ipAddress,
      userAgent,
    };
  }
}
