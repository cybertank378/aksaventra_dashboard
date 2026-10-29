"use client";

import { Activity, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLicenseApi } from "@/modules/licenses/presentation/hooks/useLicenseApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import LinkButton from "@/shared-ui/component/LinkButton";
import TextField from "@/shared-ui/component/TextField";

export default function EngineMonitorPage() {
  const { validatedLicense, loading, error, validateLicense } = useLicenseApi();
  const [serialKey, setSerialKey] = useState("AKSA-ENTERPRISE-2026-9F2A");
  const [hwid, setHwid] = useState("HWID-WIN11-AX98-7712");
  const [engineVersion, setEngineVersion] = useState("v1.4.2");

  const handleTestValidate = async () => {
    await validateLicense({
      serial_key: serialKey,
      hwid,
      engine_version: engineVersion,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Engine Validation & Integrity Monitor
          </h1>
          <p className="text-sm text-slate-500">
            Pemantauan telemetri validasi real-time (/api/v1/validate) dan checksum SHA-256 binary
            aksaventra_engine.exe
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <LinkButton
            href="/dashboard/engine/integrity"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={ShieldCheck}
          >
            Integritas Binary (SHA-256)
          </LinkButton>

          <Badge color="success" variant="soft">
            Endpoint /api/v1/validate Aktif
          </Badge>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Simulasi Validasi Engine</h2>
            <p className="text-xs text-slate-500">
              Uji respon penguncian HWID pada endpoint /api/v1/validate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField
            label="Serial Key"
            value={serialKey}
            onChange={(e) => setSerialKey(e.target.value)}
          />
          <TextField
            label="Hardware ID (HWID)"
            value={hwid}
            onChange={(e) => setHwid(e.target.value)}
          />
          <TextField
            label="Versi Binary Engine"
            value={engineVersion}
            onChange={(e) => setEngineVersion(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="filled"
            color="primary"
            leftIcon={ShieldCheck}
            loading={loading}
            onClick={handleTestValidate}
          >
            Uji Validasi Sekarang
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {validatedLicense && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <p className="font-bold">{validatedLicense.message}</p>
            <p className="mt-1 font-mono">Klien: {validatedLicense.client_name}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
