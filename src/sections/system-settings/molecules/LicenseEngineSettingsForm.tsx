"use client";

import type { LicenseEngineSettingsDTO } from "@/modules/settings/domain/dto/SystemSettingsResponseDTO";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import { SettingToggleRow } from "../atomic/SettingToggleRow";

interface LicenseEngineSettingsFormProps {
  values: LicenseEngineSettingsDTO;
  onChange: <K extends keyof LicenseEngineSettingsDTO>(
    key: K,
    value: LicenseEngineSettingsDTO[K],
  ) => void;
  disabled?: boolean;
}

export function LicenseEngineSettingsForm({
  values,
  onChange,
  disabled = false,
}: LicenseEngineSettingsFormProps) {
  return (
    <div className="space-y-6">
      {/* SECTION 1: SIKLUS HIDUP & KANAL */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Kebijakan Siklus Hidup & Peringatan Lisensi
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Atur batas ambang peringatan dan kanal default pembaruan binary engine aksaventra.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Ambang Peringatan 'Segera Habis' (Hari)"
            type="number"
            min={7}
            max={90}
            value={values.expiringSoonThresholdDays}
            onChange={(e) =>
              onChange("expiringSoonThresholdDays", Number.parseInt(e.target.value, 10) || 30)
            }
            helperText="Lisensi dengan sisa hari ≤ nilai ini akan ditandai pada dasbor (Rentang: 7–90 hari)."
            disabled={disabled}
          />

          <SelectField
            label="Kanal Auto-Updater Default"
            value={values.defaultReleaseChannel}
            onChange={(e) =>
              onChange("defaultReleaseChannel", e.target.value as "STABLE" | "BETA" | "NIGHTLY")
            }
            helperText="Kanal default bagi engine klien yang tidak menentukan kanal spesifik."
            disabled={disabled}
          >
            <option value="STABLE">STABLE (Direkomendasikan untuk Produksi)</option>
            <option value="BETA">BETA (Pratinjau Fitur Baru)</option>
            <option value="NIGHTLY">NIGHTLY (Eksperimental & Build Otomatis)</option>
          </SelectField>

          <TextField
            label="Batas Permintaan Validasi per Menit (Rate Limit)"
            type="number"
            min={10}
            max={1000}
            value={values.validationRateLimitPerMin}
            onChange={(e) =>
              onChange("validationRateLimitPerMin", Number.parseInt(e.target.value, 10) || 60)
            }
            helperText="Maksimal permintaan /api/v1/validate per IP/Serial Key per menit (Rentang: 10–1000)."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Aturan Validasi & Keamanan Biner Engine
        </h3>
        <p className="text-xs text-slate-500 mb-2">
          Kendali keamanan penegakan integritas SHA-256 dan pembatasan versi engine klien.
        </p>

        <div className="space-y-1">
          <SettingToggleRow
            name="enforceBinaryIntegrityCheck"
            label="Wajibkan Verifikasi Checksum SHA-256 Biner (#39)"
            description="Tolak permintaan validasi jika hash SHA-256 engine klien tidak cocok dengan rilis resmi atau berstatus REVOKED."
            checked={values.enforceBinaryIntegrityCheck}
            onChange={(val) => onChange("enforceBinaryIntegrityCheck", val)}
            badgeText="Keamanan #39"
            badgeVariant="success"
            disabled={disabled}
          />

          <SettingToggleRow
            name="blockOutdatedEngineClients"
            label="Blokir Engine Klien di Bawah Versi Minimum (minSupportedVersion)"
            description="Paksa klien engine memperbarui biner sebelum sistem memberikan izin eksekusi lisensi."
            checked={values.blockOutdatedEngineClients}
            onChange={(val) => onChange("blockOutdatedEngineClients", val)}
            badgeText="Mandatory Update"
            badgeVariant="info"
            disabled={disabled}
          />

          <SettingToggleRow
            name="maintenanceMode"
            label="Mode Pemeliharaan Sistem (Maintenance Mode)"
            description="Saat aktif, seluruh permintaan validasi engine klien akan ditolak sementara dengan kode 503."
            checked={values.maintenanceMode}
            onChange={(val) => onChange("maintenanceMode", val)}
            badgeText="Peringatan Kritis"
            badgeVariant="error"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
