"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecentLicensesResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { useDashboardApi } from "@/modules/dashboards/presentation/hooks/useDashboardApi";
import {
  LicenseStatusTabs,
  type StatusTabKey,
} from "@/sections/dashboard/molecules/LicenseStatusTabs";
import { RecentLicensesTableView } from "@/sections/dashboard/molecules/RecentLicensesTableView";
import Card from "@/shared-ui/component/Card";

export interface RecentLicensesOrganismProps {
  canManage?: boolean;
}

export function RecentLicensesOrganism({
  canManage = true,
}: RecentLicensesOrganismProps): React.JSX.Element {
  const { getRecentLicenses, loading } = useDashboardApi();
  const [currentTab, setCurrentTab] = useState<StatusTabKey>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [response, setResponse] = useState<RecentLicensesResponseDTO | undefined>(undefined);

  const fetchLicenses = useCallback(
    async (status: StatusTabKey, page: number) => {
      try {
        const data = await getRecentLicenses({
          status,
          page,
          limit: 5,
        });
        if (data) {
          setResponse(data);
        }
      } catch {
        // Handled by api executor
      }
    },
    [getRecentLicenses],
  );

  useEffect(() => {
    fetchLicenses(currentTab, currentPage);
  }, [fetchLicenses, currentTab, currentPage]);

  const handleTabChange = (newTab: StatusTabKey) => {
    setCurrentTab(newTab);
    setCurrentPage(1);
    fetchLicenses(newTab, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchLicenses(currentTab, newPage);
  };

  return (
    <Card className="flex flex-col gap-5 border-slate-200/90 p-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Daftar Lisensi & Alokasi Perangkat Terbaru
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Pemantauan binding HWID mesin klien dan siklus kedaluwarsa lisensi
        </p>
      </div>

      <LicenseStatusTabs
        currentTab={currentTab}
        counts={response?.counts}
        onTabChange={handleTabChange}
      />

      <RecentLicensesTableView
        items={response?.items}
        total={response?.total ?? 0}
        page={currentPage}
        limit={5}
        loading={loading && !response}
        canManage={canManage}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}

export default RecentLicensesOrganism;
