"use client";

import type React from "react";
import type { UserRole } from "@/libs/enums";
import { DashboardAnalyticsOrganism } from "@/sections/dashboard/organisms/DashboardAnalyticsOrganism";
import { DashboardSummaryOrganism } from "@/sections/dashboard/organisms/DashboardSummaryOrganism";
import { RecentLicensesOrganism } from "@/sections/dashboard/organisms/RecentLicensesOrganism";
import { canAccess } from "@/security/fieldGuard";

export interface DashboardOverviewPageProps {
  userRole?: UserRole;
}

export function DashboardOverviewPage({
  userRole = "ADMIN",
}: DashboardOverviewPageProps): React.JSX.Element {
  const canManage = canAccess(userRole, "LICENSES_MANAGE");

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* ROW 1 & 2: Executive Summary KPIs and Renewal Warning Banner */}
      <DashboardSummaryOrganism />

      {/* ROW 3 & 4: Analytical Charts (Validation Trend, Status Donut, Issuance, Expiry Forecast) & Activities */}
      <DashboardAnalyticsOrganism />

      {/* ROW 5: Recent Licenses & Device Allocation Table */}
      <RecentLicensesOrganism canManage={canManage} />
    </div>
  );
}

export default DashboardOverviewPage;
