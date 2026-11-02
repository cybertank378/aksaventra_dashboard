"use client";

import { Bell, Send } from "lucide-react";
import { type FC, useState } from "react";
import type { RenewalWarningDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import Button from "@/shared-ui/component/Button";
import { RenewalReminderModal } from "./RenewalReminderModal";

export interface RenewalWarningBannerProps {
  warnings: RenewalWarningDTO[];
  onManageClick?: () => void;
  onSendReminders?: (licenseIds: string[]) => Promise<void>;
  isSending?: boolean;
}

export const RenewalWarningBanner: FC<RenewalWarningBannerProps> = ({
  warnings,
  onManageClick,
  onSendReminders,
  isSending = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  const handleManage = () => {
    onManageClick?.();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmSend = async (selectedLicenseIds: string[]) => {
    if (onSendReminders) {
      await onSendReminders(selectedLicenseIds);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Peringatan Perpanjangan Lisensi Mendekati Batas Kedaluwarsa
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-amber-800">
              {warnings.map((w, idx) => (
                <span key={w.id} className="inline-flex items-center gap-1">
                  <span className="font-semibold text-amber-950">{w.clientName}</span>
                  <span className="text-amber-700">
                    ({w.daysRemaining === 0 ? "Hari ini" : `${w.daysRemaining} hari lagi`})
                  </span>
                  {idx < warnings.length - 1 && <span className="text-amber-300">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
            loading={isSending}
            leftIcon={Send}
            className="border-amber-300 bg-white/90 text-amber-800 hover:bg-white hover:border-amber-400 focus:ring-amber-400 font-medium"
          >
            Kirim Pengingat
          </Button>
          <Button
            variant="filled"
            color="warning"
            size="sm"
            onClick={handleManage}
            className="bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500"
          >
            Kelola Lisensi
          </Button>
        </div>
      </div>

      <RenewalReminderModal
        open={isModalOpen}
        onClose={handleCloseModal}
        warnings={warnings}
        onConfirm={handleConfirmSend}
        isLoading={isSending}
      />
    </>
  );
};

export default RenewalWarningBanner;
