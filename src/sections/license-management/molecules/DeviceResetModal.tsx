"use client";

import type { LicenseItemViewModel } from "@/sections/license-management/molecules/LicenseTableView";
import Badge from "@/shared-ui/component/Badge";
import { Modal } from "@/shared-ui/component/Modal";

interface Props {
  open: boolean;
  license: LicenseItemViewModel | null;
  onClose: () => void;
  onConfirmReset: (license: LicenseItemViewModel) => void;
}

export default function DeviceResetModal({ open, license, onClose, onConfirmReset }: Props) {
  return (
    <Modal
      open={open}
      title="Konfirmasi Reset Ikatan Perangkat (HWID)"
      subtitle="Melepaskan kunci Hardware ID agar klien dapat mengaktivasi ulang pada mesin baru"
      onClose={onClose}
      onSubmit={() => {
        if (license) {
          onConfirmReset(license);
        }
      }}
      submitText="Reset HWID Sekarang"
      cancelText="Batal"
      submitColor="warning"
      size="md"
    >
      {license && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
            <span className="text-xs font-medium text-slate-500">HWID Saat Ini</span>
            <Badge color="warning" variant="soft" className="font-mono">
              {license.hwid ?? "Tidak Terikat"}
            </Badge>
          </div>
        </div>
      )}
    </Modal>
  );
}
