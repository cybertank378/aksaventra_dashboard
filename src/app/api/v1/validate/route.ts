import type { NextRequest } from "next/server";
import { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseController } from "@/modules/licenses/infrastructure/http/LicenseController";
import { LicenseRepository } from "@/modules/licenses/infrastructure/repo/LicenseRepository";

// Factory DI Assembler
function createLicenseController(): LicenseController {
  const repo = new LicenseRepository();
  const services = new LicenseServices(repo);
  return new LicenseController(services);
}

const controller = createLicenseController();

export async function POST(req: NextRequest) {
  return controller.validate(req);
}
