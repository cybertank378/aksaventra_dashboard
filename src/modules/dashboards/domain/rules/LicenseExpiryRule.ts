import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";
import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";
import type { LicenseStatus } from "@/modules/licenses/domain/entity/LicenseEntity";

export class LicenseExpiryRule {
  public static evaluate(
    status: LicenseStatus,
    expiresAt: Date | null | undefined,
    now: Date,
    expiringDays: number = EXPIRING_SOON_DAYS,
  ): DashboardLicenseState {
    if (status === "SUSPENDED") {
      return "SUSPENDED";
    }

    if (status === "EXPIRED") {
      return "EXPIRED";
    }

    if (!expiresAt) {
      return "ACTIVE";
    }

    const expiryTime = expiresAt.getTime();
    const nowTime = now.getTime();

    if (expiryTime <= nowTime) {
      return "EXPIRED";
    }

    const windowLimitTime = nowTime + expiringDays * 24 * 60 * 60 * 1000;
    if (expiryTime <= windowLimitTime) {
      return "EXPIRING_SOON";
    }

    return "ACTIVE";
  }
}
