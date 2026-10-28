"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLicenseApi } from "@/modules/licenses/presentation/hooks/useLicenseApi";
import LicenseCreateFormView, {
  type CreateLicenseFormValues,
} from "@/sections/license-management/molecules/LicenseCreateFormView";
import Badge from "@/shared-ui/component/Badge";
import Card from "@/shared-ui/component/Card";
import LinkButton from "@/shared-ui/component/LinkButton";

export default function LicenseCreateOrganism() {
  const { loading } = useLicenseApi();
  const [createdLicense, setCreatedLicense] = useState<CreateLicenseFormValues | null>(null);

  const handleCreateLicense = (values: CreateLicenseFormValues) => {
    setCreatedLicense(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Terbitkan Lisensi Baru</h1>
          <p className="text-sm text-slate-500">
            Buat Serial Key resmi untuk aktivasi klien binary aksaventra_engine.exe
          </p>
        </div>

        <LinkButton
          href="/dashboard/licenses"
          variant="outline"
          color="secondary"
          leftIcon={ArrowLeft}
        >
          Kembali ke Semua Lisensi
        </LinkButton>
      </div>

      {createdLicense && (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Lisensi Berhasil Diterbitkan untuk {createdLicense.clientName}
                </p>
                <p className="font-mono text-xs text-emerald-800">
                  Serial Key: {createdLicense.serialKey} ({createdLicense.durationMonths} Bulan)
                </p>
              </div>
            </div>

            <Badge color="success" variant="filled">
              Siap Aktivasi HWID
            </Badge>
          </div>
        </Card>
      )}

      <LicenseCreateFormView loading={loading} onSubmitLicense={handleCreateLicense} />
    </div>
  );
}

