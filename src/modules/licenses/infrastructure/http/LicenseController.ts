import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import type { LicenseServices } from "../../application/services/LicenseServices";
import { LicenseValidator } from "../validators/license.validator";

export class LicenseController extends BaseController {
  constructor(private readonly licenseServices: LicenseServices) {
    super();
  }

  protected async handle(req: NextRequest): Promise<NextResponse> {
    try {
      const rawBody = await req.json();
      const validation = LicenseValidator.validate(rawBody);

      if (!validation.isValid || !validation.data) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        const errorMessage = validation.errors[firstErrorKey] ?? "Payload validasi tidak valid";
        return NextResponse.json(
          {
            valid: false,
            message: errorMessage,
          },
          { status: 400 },
        );
      }

      const result = await this.licenseServices.validateLicense(validation.data);

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
    } catch (err) {
      console.error("[LicenseController] Validation Exception:", err);
      return NextResponse.json(
        {
          valid: false,
          message: "Internal server error during license validation",
        },
        { status: 500 },
      );
    }
  }

  public validate(req: NextRequest): Promise<NextResponse> {
    return this.execute(req);
  }
}
