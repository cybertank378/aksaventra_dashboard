"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { DashboardSummaryResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { useDashboardApi } from "@/modules/dashboards/presentation/hooks/useDashboardApi";
import { DashboardKpiGrid } from "@/sections/dashboard/molecules/DashboardKpiGrid";
import { RenewalWarningBanner } from "@/sections/dashboard/molecules/RenewalWarningBanner";
import Button from "@/shared-ui/component/Button";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export function DashboardSummaryOrganism(): React.JSX.Element {
  const router = useRouter();
  const { getSummary, sendRenewalReminders, loading, error } = useDashboardApi();
  const [summary, setSummary] = useState<DashboardSummaryResponseDTO | undefined>(undefined);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getSummary();
      if (data) {
        setSummary(data);
      }
    } catch {
      // Handled by api executor
    }
  }, [getSummary]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleManageClick = () => {
    router.push("/dashboard/licenses");
  };

  const handleRetry = () => {
    fetchSummary();
  };

  const handleSendReminders = async (licenseIds: string[]) => {
    setIsSendingReminder(true);
    try {
      const result = await sendRenewalReminders(licenseIds);
      if (result) {
        showSuccessToast(result.message || "Pengingat perpanjangan lisensi berhasil dikirim.");
        await fetchSummary();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memproses pengiriman pengingat perpanjangan";
      showErrorToast(message);
    } finally {
      setIsSendingReminder(false);
    }
  };

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-rose-800">Gagal memuat ringkasan KPI dasbor</p>
        <p className="mt-1 text-xs text-rose-600">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRetry} className="mt-3">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardKpiGrid summary={summary} loading={loading && !summary} />
      {summary?.renewalWarnings && summary.renewalWarnings.length > 0 && (
        <RenewalWarningBanner
          warnings={summary.renewalWarnings}
          onManageClick={handleManageClick}
          onSendReminders={handleSendReminders}
          isSending={isSendingReminder}
        />
      )}
    </div>
  );
}

export default DashboardSummaryOrganism;
