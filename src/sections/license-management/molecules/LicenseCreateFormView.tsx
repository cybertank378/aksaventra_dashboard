"use client";

import { KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { LicenseTier } from "@/sections/license-management/molecules/LicenseTableView";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

export interface CreateLicenseFormValues {
  clientName: string;
  serialKey: string;
  tier: LicenseTier;
  durationMonths: number;
  vaultSecret: string;
}

interface Props {
  loading?: boolean;
  onSubmitLicense: (values: CreateLicenseFormValues) => void;
}

function generateSerialKey(tier: LicenseTier): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  return `AKSA-${tier}-${year}-${randomPart}`;
}

export default function LicenseCreateFormView({ loading = false, onSubmitLicense }: Props) {
  const [clientName, setClientName] = useState("");
  const [tier, setTier] = useState<LicenseTier>("PRO");
  const [durationMonths, setDurationMonths] = useState(12);
  const [serialKey, setSerialKey] = useState(() => generateSerialKey("PRO"));
  const [vaultSecret, setVaultSecret] = useState("AKSAVENTRA_VAULT_SEED_2026");

  const handleRegenerateKey = () => {
    setSerialKey(generateSerialKey(tier));
  };

  const handleSubmit = () => {
    if (!clientName.trim() || !serialKey.trim()) {
      return;
    }

    onSubmitLicense({
      clientName: clientName.trim(),
      serialKey: serialKey.trim(),
      tier,
      durationMonths,
      vaultSecret: vaultSecret.trim(),
    });
  };

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Form Penerbitan Serial Key Baru</h2>
          <p className="text-sm text-slate-500">
            Konfigurasi identitas instansi, masa aktif, dan seed enkripsi untuk aksaventra_engine
          </p>
        </div>
        <Badge color="primary" variant="soft">
          1 Tahun Default Lock
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Nama Instansi / Klien"
          placeholder="Contoh: Universitas Aksaventra"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          helperText="Nama resmi organisasi pemilik lisensi"
        />

        <SelectField
          label="Tier Lisensi"
          value={tier}
          onChange={(e) => {
            const nextTier = e.target.value as LicenseTier;
            setTier(nextTier);
            setSerialKey(generateSerialKey(nextTier));
          }}
          helperText="Menentukan profil kapasitas layanan engine"
        >
          <option value="TRIAL">Trial (Evaluasi 30 Hari)</option>
          <option value="PRO">Pro (Single Node Engine)</option>
          <option value="ENTERPRISE">Enterprise (Multi-Service Cluster)</option>
        </SelectField>

        <TextField
          label="Serial Key"
          value={serialKey}
          leftIcon={KeyRound}
          onChange={(e) => setSerialKey(e.target.value)}
          helperText="Kunci unik yang dimasukkan pada aksaventra_engine.exe"
        />

        <SelectField
          label="Durasi Masa Aktif"
          value={String(durationMonths)}
          onChange={(e) => setDurationMonths(Number(e.target.value))}
          helperText="Masa berlaku otomatis dihitung sejak aktivasi pertama"
        >
          <option value="1">1 Bulan (Trial)</option>
          <option value="6">6 Bulan (Semester)</option>
          <option value="12">12 Bulan (1 Tahun Standar)</option>
          <option value="24">24 Bulan (2 Tahun Multi-Year)</option>
        </SelectField>
      </div>

      <TextField
        label="Vault Secret Seed"
        value={vaultSecret}
        onChange={(e) => setVaultSecret(e.target.value)}
        helperText="Seed kriptografis yang dikirim ke aksaventra.token saat validasi sukses"
      />

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          color="secondary"
          leftIcon={RefreshCw}
          onClick={handleRegenerateKey}
        >
          Generate Ulang Key
        </Button>

        <Button
          variant="filled"
          color="primary"
          leftIcon={ShieldCheck}
          loading={loading}
          disabled={!clientName.trim()}
          onClick={handleSubmit}
        >
          Terbitkan Lisensi
        </Button>
      </div>
    </Card>
  );
}

