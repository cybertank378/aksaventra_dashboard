"use client";

import { useState } from "react";
import type { LicenseAdminItemDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import Badge from "@/shared-ui/component/Badge";
import { Modal } from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

interface Props {
  open: boolean;
  license: LicenseAdminItemDTO | null;
  loading?: boolean;
  onClose: () => void;
  onConfirmReset: (license: LicenseAdminItemDTO, reason?: string) => void;
}

export default function DeviceResetModal({
  open,
  license,
  loading = false,
  onClose,
  onConfirmReset,
}: Props) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (license) {
      onConfirmReset(license, reason.trim() || undefined);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Konfirmasi Lepas Ikatan Perangkat (HWID)"
      subtitle="Melepaskan ikatan Hardware ID agar binary aksaventra_engine.exe dapat mengaktivasi mesin baru"
      onClose={handleClose}
      onSubmit={handleConfirm}
      submitText={loading ? "Memproses..." : "Lepas Ikatan HWID Sekarang"}
      cancelText="Batal"
      submitColor="warning"
      submitLoading={loading}
      submitDisabled={loading}
      size="md"
    >
      {license && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900">
            ⚠️ <strong>Perhatian:</strong> Tindakan ini akan mengosongkan nilai HWID pada database
            dan mencatat riwayat ke <strong>AuditLog</strong>. Klien dapat mengikatkan mesin baru
            pada request validasi berikutnya.
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Instansi Klien</span>
              <span className="text-sm font-semibold text-slate-900">{license.clientName}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Serial Key</span>
              <span className="font-mono text-xs font-semibold text-slate-900">
                {license.serialKey}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">HWID Terikat Saat Ini</span>
              <Badge color="warning" variant="soft" className="font-mono text-[11px]">
                {license.hwid ?? "Tidak Terikat"}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Alasan Pelepasan HWID (Audit Trail)
            </label>
            <TextField
              placeholder="Contoh: Penggantian motherboard atau migrasi server..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
