"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import type { RetentionAuditSettingsDTO } from "@/modules/settings/domain/dto/SystemSettingsResponseDTO";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";

interface RetentionAuditSettingsFormProps {
  values: RetentionAuditSettingsDTO;
  onChange: <K extends keyof RetentionAuditSettingsDTO>(
    key: K,
    value: RetentionAuditSettingsDTO[K],
  ) => void;
  onOpenPurgeModal: () => void;
  disabled?: boolean;
}

export function RetentionAuditSettingsForm({
  values,
  onChange,
  onOpenPurgeModal,
  disabled = false,
}: RetentionAuditSettingsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Kebijakan Masa Simpan (Retensi) Log Telemetri
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tentukan masa simpan riwayat log validasi mesin dan log pembaruan otomatis sebelum
          dianggap usang.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Masa Simpan Log Validasi Mesin (Hari)"
            type="number"
            min={30}
            max={730}
            value={values.validationLogRetentionDays}
            onChange={(e) =>
              onChange("validationLogRetentionDays", Number.parseInt(e.target.value, 10) || 180)
            }
            helperText="Data log validasi lisensi lebih lama dari nilai ini memenuhi syarat pembersihan (Rentang: 30–730 hari)."
            disabled={disabled}
          />

          <TextField
            label="Masa Simpan Log Telemetri Pembaruan (Hari)"
            type="number"
            min={30}
            max={365}
            value={values.updateLogRetentionDays}
            onChange={(e) =>
              onChange("updateLogRetentionDays", Number.parseInt(e.target.value, 10) || 90)
            }
            helperText="Data log cek pembaruan binary engine lebih lama dari nilai ini memenuhi syarat pembersihan (Rentang: 30–365 hari)."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Tindakan Pemeliharaan Basis Data Manual
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Jalankan pembersihan permanen data log yang melampaui batas hari retensi aktif saat ini.
        </p>

        <Card className="p-4 bg-slate-50 border-amber-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Bersihkan Log Kedaluwarsa Sekarang
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-lg leading-relaxed">
                  Menghapus baris log validasi (&gt; {values.validationLogRetentionDays} hari) dan
                  log pembaruan (&gt; {values.updateLogRetentionDays} hari). Tindakan ini bersifat
                  permanen dan akan dicatat ke dalam AuditLog.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onOpenPurgeModal}
                disabled={disabled}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Bersihkan Log Lama
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
