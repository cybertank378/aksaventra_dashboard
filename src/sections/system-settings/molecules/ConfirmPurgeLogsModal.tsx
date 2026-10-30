"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";

interface ConfirmPurgeLogsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (target: "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS") => Promise<void>;
  isPurging: boolean;
  validationRetentionDays: number;
  updateRetentionDays: number;
}

export function ConfirmPurgeLogsModal({
  open,
  onClose,
  onConfirm,
  isPurging,
  validationRetentionDays,
  updateRetentionDays,
}: ConfirmPurgeLogsModalProps) {
  const [target, setTarget] = useState<"ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS">("ALL");
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirmPurge = async () => {
    if (!acknowledged) return;
    await onConfirm(target);
    setAcknowledged(false);
  };

  return (
    <Modal
      open={open}
      onClose={isPurging ? () => {} : onClose}
      title="Konfirmasi Pembersihan Log Usang"
      subtitle="Pembersihan permanen log telemetri yang telah melampaui masa retensi"
      onSubmit={handleConfirmPurge}
      submitText="Hapus Log Secara Permanen"
      cancelText="Batal"
      submitColor="error"
      submitDisabled={!acknowledged}
      submitLoading={isPurging}
    >
      <div className="space-y-4 py-2">
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-800 leading-relaxed">
            <p className="font-semibold text-red-900 mb-0.5">Tindakan Tidak Dapat Dibatalkan!</p>
            Log yang telah dihapus tidak dapat dipulihkan kembali. Pastikan Anda telah mengarsipkan
            data telemetri jika dibutuhkan untuk keperluan audit regulasi.
          </div>
        </div>

        <div>
          <SelectField
            label="Target Log yang Akan Dibersihkan"
            value={target}
            onChange={(e) => setTarget(e.target.value as "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS")}
            helperText="Pilih kelompok tabel log yang ingin dibersihkan sesuai usia retensi."
            disabled={isPurging}
          >
            <option value="ALL">
              Semua Log Usang (Validasi &gt; {validationRetentionDays} hr & Update &gt;{" "}
              {updateRetentionDays} hr)
            </option>
            <option value="VALIDATION_LOGS">
              Hanya Log Validasi Mesin (Lebih dari {validationRetentionDays} hari)
            </option>
            <option value="UPDATE_LOGS">
              Hanya Log Telemetri Pembaruan (Lebih dari {updateRetentionDays} hari)
            </option>
          </SelectField>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={isPurging}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <span>
              Saya menyetujui pembersihan log usang dan memahami data akan dihapus permanen.
            </span>
          </label>
        </div>
      </div>
    </Modal>
  );
}
