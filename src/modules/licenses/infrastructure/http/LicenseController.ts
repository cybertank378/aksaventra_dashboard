import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import type { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseValidator } from "@/modules/licenses/infrastructure/validators/license.validator";

export class LicenseController extends BaseController {
  constructor(private readonly licenseServices: LicenseServices) {
    super();
  }

  protected async handle(req: NextRequest): Promise<NextResponse> {
    try {
      const parsedBody = await req.json().catch(() => null);
      const headerKey =
        req.headers.get("x-license-key") ??
        req.headers.get("x-engine-license-key") ??
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const headerHwid = req.headers.get("x-hwid") ?? req.headers.get("x-machine-id");

      const rawBody =
        parsedBody && typeof parsedBody === "object"
          ? {
              ...(headerKey ? { serial_key: headerKey } : {}),
              ...(headerHwid ? { hwid: headerHwid } : {}),
              ...(parsedBody as Record<string, unknown>),
            }
          : parsedBody;

      const validation = LicenseValidator.validate(rawBody);

      if (!validation.isValid || !validation.data) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        const errorMessage = validation.errors[firstErrorKey] ?? "Payload validasi tidak valid";
        console.warn("[LicenseController] 400 Validation Rejected:", {
          errors: validation.errors,
          receivedKeys:
            rawBody && typeof rawBody === "object"
              ? Object.keys(rawBody as object)
              : typeof rawBody,
        });
        return NextResponse.json(
          {
            valid: false,
            message: errorMessage,
          },
          { status: 400 },
        );
      }

      const clientIp =
        validation.data.public_ip ||
        validation.data.clientIp ||
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-client-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        undefined;
      const userAgent = req.headers.get("user-agent") ?? undefined;

      const result = await this.licenseServices.validateLicense({
        ...validation.data,
        clientIp,
        userAgent,
      });

      if (result.isSuccess) {
        const data = result.getValue();
        return NextResponse.json(data, { status: 200 });
      }

      const error = result.getError();
      return NextResponse.json(
        {
          valid: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    } catch (_error) {
      return NextResponse.json(
        {
          valid: false,
          message: "Internal server error saat validasi lisensi",
        },
        { status: 500 },
      );
    }
  }

  public async validate(req: NextRequest): Promise<NextResponse> {
    return this.handle(req);
  }
}
