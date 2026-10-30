"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "@/shared-ui/component/Button";
import { Modal } from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmPrune: (days: number) => Promise<void>;
  loading: boolean;
}

export const ValidationLogPruneModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirmPrune,
  loading,
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(90);

  const handlePrune = async () => {
    await onConfirmPrune(selectedDays);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pembersihan Storage Log Validasi"
      subtitle="Pangkas log validasi historis untuk menjaga efisiensi database."
      size="md"
      cancelText="Batal"
      submitText=""
      className="p-6"
    >
      <div className="space-y-5 text-sm text-slate-700">
        {/* Info Box */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold">Kebijakan Retensi Database (SRE Standard)</p>
            <p className="mt-1 text-amber-800">
              Sistem secara otomatis membersihkan log yang lebih tua dari 3 bulan (90 hari). Anda
              juga dapat melakukan pembersihan manual sekarang untuk menghemat kapasitas storage
              PostgreSQL/Prisma.
            </p>
          </div>
        </div>

        {/* Retention Dropdown */}
        <div>
          <label
            htmlFor="retention-days-select"
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            Pilih Ambang Batas Usia Log
          </label>
          <SelectField
            id="retention-days-select"
            value={String(selectedDays)}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="w-full text-xs font-semibold"
          >
            <option value="90">90 Hari (3 Bulan) — Standar Rekomendasi</option>
            <option value="60">60 Hari (2 Bulan)</option>
            <option value="30">30 Hari (1 Bulan)</option>
            <option value="14">14 Hari (2 Minggu)</option>
          </SelectField>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Log validasi mesin yang tercatat sebelum rentang waktu ini akan dihapus secara permanen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="filled"
            color="error"
            size="sm"
            onClick={handlePrune}
            loading={loading}
            leftIcon={Trash2}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {loading ? "Memangkas..." : "Pangkas Log Sekarang"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
