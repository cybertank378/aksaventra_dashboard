"use client";

import { Calendar, CheckSquare, Key, Mail, Send, ShieldCheck, Square } from "lucide-react";
import { type FC, useState } from "react";
import type { RenewalWarningDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import { Modal } from "@/shared-ui/component/Modal";

export interface RenewalReminderModalProps {
  open: boolean;
  onClose: () => void;
  warnings: RenewalWarningDTO[];
  onConfirm: (selectedLicenseIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export const RenewalReminderModal: FC<RenewalReminderModalProps> = ({
  open,
  onClose,
  warnings,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => warnings.map((w) => w.id));

  // Sync if warnings change
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === warnings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(warnings.map((w) => w.id));
    }
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) return;
    await onConfirm(selectedIds);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kirim Pengingat Perpanjangan Lisensi"
      subtitle="Kirimkan notifikasi resmi kepada klien yang masa berlaku lisensinya mendekati batas kedaluwarsa."
      size="md"
    >
      <div className="space-y-4 py-1">
        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-900 shadow-xs">
          <Mail className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              Notifikasi Perpanjangan & Rekam Jejak Audit
            </p>
            <p className="text-amber-800 leading-relaxed">
              Pengingat akan diterbitkan ke kanal email kontak terkait dan otomatis dicatat ke tabel{" "}
              <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded text-amber-900">
                audit_logs
              </code>{" "}
              sebagai bukti kepatuhan administratif.
            </p>
          </div>
        </div>

        {/* Header selection control */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              {selectedIds.length === warnings.length ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              Pilih Semua Lisensi
            </button>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {selectedIds.length} dari {warnings.length} dipilih
          </span>
        </div>

        {/* Licenses List */}
        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
          {warnings.map((w) => {
            const isSelected = selectedIds.includes(w.id);
            const formattedDate = new Date(w.expiresAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={w.id}
                onClick={() => handleToggleSelect(w.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleSelect(w.id);
                  }
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={isSelected}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-300 bg-amber-50/40 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0 text-slate-600">
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{w.clientName}</h5>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                      <Key className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{w.serialKeyMasked}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge color={w.daysRemaining <= 7 ? "error" : "warning"} variant="soft">
                    {w.daysRemaining === 0 ? "Hari ini" : `${w.daysRemaining} hari lagi`}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="h-2.5 w-2.5" />
                    {formattedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verifikasi otorisasi admin aktif</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              variant="filled"
              color="warning"
              size="sm"
              leftIcon={Send}
              loading={isLoading}
              disabled={selectedIds.length === 0 || isLoading}
              onClick={handleSend}
              className="bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500"
            >
              Kirim Notifikasi ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RenewalReminderModal;
