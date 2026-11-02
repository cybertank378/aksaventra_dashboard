"use client";

import type { SecurityAuthSettingsDTO } from "@/modules/settings/domain/dto/SystemSettingsResponseDTO";
import TextField from "@/shared-ui/component/TextField";
import { SettingToggleRow } from "../atomic/SettingToggleRow";

interface SecurityAuthSettingsFormProps {
  values: SecurityAuthSettingsDTO;
  onChange: <K extends keyof SecurityAuthSettingsDTO>(
    key: K,
    value: SecurityAuthSettingsDTO[K],
  ) => void;
  disabled?: boolean;
}

export function SecurityAuthSettingsForm({
  values,
  onChange,
  disabled = false,
}: SecurityAuthSettingsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Kebijakan Percobaan Login & Penguncian Akun
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Cegah serangan brute-force dengan membatasi percobaan kata sandi salah secara otomatis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Batas Gagal Login Sebelum Akun Terkunci (Kali)"
            type="number"
            min={3}
            max={15}
            value={values.maxFailedLoginAttempts}
            onChange={(e) =>
              onChange("maxFailedLoginAttempts", Number.parseInt(e.target.value, 10) || 5)
            }
            helperText="Jumlah kegagalan autentikasi beruntun yang diizinkan (Rentang: 3–15 kali)."
            disabled={disabled}
          />

          <TextField
            label="Durasi Penguncian Akun Otomatis (Menit)"
            type="number"
            min={5}
            max={1440}
            value={values.accountLockoutMinutes}
            onChange={(e) =>
              onChange("accountLockoutMinutes", Number.parseInt(e.target.value, 10) || 30)
            }
            helperText="Waktu akun terkunci sementara sebelum dapat mencoba login kembali (Rentang: 5–1440 menit)."
            disabled={disabled}
          />

          <TextField
            label="Masa Berlaku Sesi Dasbor (Jam)"
            type="number"
            min={1}
            max={168}
            value={values.sessionTtlHours}
            onChange={(e) => onChange("sessionTtlHours", Number.parseInt(e.target.value, 10) || 24)}
            helperText="Sesi login dashboard pengguna akan kedaluwarsa setelah durasi ini (Rentang: 1–168 jam)."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Aturan Verifikasi Akun Baru</h3>
        <p className="text-xs text-slate-500 mb-2">
          Kendali persyaratan autentikasi tambahan untuk pengguna baru.
        </p>

        <SettingToggleRow
          name="requireEmailVerification"
          label="Wajibkan Verifikasi Email untuk Akun Baru"
          description="Pengguna baru harus mengonfirmasi tautan verifikasi email sebelum diizinkan mengakses dasbor."
          checked={values.requireEmailVerification}
          onChange={(val) => onChange("requireEmailVerification", val)}
          badgeText="Direkomendasikan"
          badgeVariant="success"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
