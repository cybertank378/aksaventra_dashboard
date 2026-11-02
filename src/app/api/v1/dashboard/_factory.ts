/* ============================================================
 * BUILD DASHBOARD CONTROLLER
 * ============================================================
 */

import { MailProvider } from "@/modules/auth/infrastructure/providers/MailProvider";
import { DashboardServices } from "@/modules/dashboards/application/services/DashboardServices";
import { DashboardController } from "@/modules/dashboards/infrastructure/http/DashboardController";
import { SystemClockProvider } from "@/modules/dashboards/infrastructure/providers/SystemClockProvider";
import { DashboardRepository } from "@/modules/dashboards/infrastructure/repo/DashboardRepository";

export function buildDashboardController(): DashboardController {
  const repository = new DashboardRepository();
  const clock = new SystemClockProvider();
  const mailProvider = new MailProvider();
  const services = new DashboardServices(repository, clock, mailProvider);

  return new DashboardController(services);
}
