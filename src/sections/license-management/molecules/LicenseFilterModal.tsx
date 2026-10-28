"use client";

import type { LicenseDisplayStatus } from "@/sections/license-management/atomic/LicenseStatusBadge";
import type { LicenseTier } from "@/sections/license-management/molecules/LicenseTableView";
import { Modal } from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";

interface Props {
  open: boolean;
  statusFilter: LicenseDisplayStatus | "ALL";
  tierFilter: LicenseTier | "ALL";
  hwidBoundOnly: boolean;
  onChangeStatus: (status: LicenseDisplayStatus | "ALL") => void;
  onChangeTier: (tier: LicenseTier | "ALL") => void;
  onChangeHwidBound: (boundOnly: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function LicenseFilterModal({
  open,
  statusFilter,
  tierFilter,
  hwidBoundOnly,
  onChangeStatus,
  onChangeTier,
  onChangeHwidBound,
  onReset,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title="Filter Direktori Lisensi"
      subtitle="Saring daftar serial key berdasarkan status aktif, tier, dan ikatan perangkat HWID"
      onClose={onClose}
      onSubmit={onClose}
      submitText="Terapkan Filter"
      cancelText="Tutup"
      size="md"
    >
      <div className="space-y-4">
        <SelectField
          label="Status Lisensi"
          value={statusFilter}
          onChange={(e) => onChangeStatus(e.target.value as LicenseDisplayStatus | "ALL")}
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Aktif (ACTIVE)</option>
          <option value="SUSPENDED">Ditangguhkan (SUSPENDED)</option>
          <option value="EXPIRED">Kedaluwarsa (EXPIRED)</option>
          <option value="REVOKED">Dicabut (REVOKED)</option>
        </SelectField>

        <SelectField
          label="Tier Lisensi"
          value={tierFilter}
          onChange={(e) => onChangeTier(e.target.value as LicenseTier | "ALL")}
        >
          <option value="ALL">Semua Tier</option>
          <option value="TRIAL">Trial</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </SelectField>

        <SelectField
          label="Status Penguncian Perangkat (HWID)"
          value={hwidBoundOnly ? "BOUND" : "ALL"}
          onChange={(e) => onChangeHwidBound(e.target.value === "BOUND")}
        >
          <option value="ALL">Semua Perangkat</option>
          <option value="BOUND">Hanya Perangkat Terikat HWID</option>
        </SelectField>

        <div className="pt-2 text-right">
          <SelectField
            label="Reset Konfigurasi Filter"
            value="KEEP"
            onChange={(e) => {
              if (e.target.value === "RESET") {
                onReset();
              }
            }}
          >
            <option value="KEEP">Pertahankan Pilihan Saat Ini</option>
            <option value="RESET">Kembalikan ke Default (Semua)</option>
          </SelectField>
        </div>
      </div>
    </Modal>
  );
}

