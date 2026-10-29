import type React from "react";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";
import { LICENSE_STATUS_CONFIG } from "@/modules/dashboards/presentation/helpers/dashboardViewMapper";

export interface LicenseExpiryBadgeProps {
  status: DashboardLicenseState;
}

export function LicenseExpiryBadge({ status }: LicenseExpiryBadgeProps): React.JSX.Element {
  const config = LICENSE_STATUS_CONFIG[status] ?? LICENSE_STATUS_CONFIG.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bgClass} ${config.textClass} ${config.borderClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}

export default LicenseExpiryBadge;
