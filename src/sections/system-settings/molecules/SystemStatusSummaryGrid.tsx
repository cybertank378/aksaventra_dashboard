"use client";

import { Activity, Database, HardDrive, ShieldCheck } from "lucide-react";
import type { SystemSettingsResponseDTO } from "@/modules/settings/domain/dto/SystemSettingsResponseDTO";
import Badge from "@/shared-ui/component/Badge";
import Card from "@/shared-ui/component/Card";

interface SystemStatusSummaryGridProps {
  settings: SystemSettingsResponseDTO | null;
}

export function SystemStatusSummaryGrid({ settings }: SystemStatusSummaryGridProps) {
  const isMaintenance = settings?.licenseEngine.maintenanceMode ?? false;
  const storageDriver =
    settings?.diagnostics.storageDriver === "s3" ? "Amazon S3 Ready" : "Local Disk Storage";
  const isBinaryEnforced = settings?.licenseEngine.enforceBinaryIntegrityCheck ?? true;
  const retentionDays = settings?.retentionAudit.validationLogRetentionDays ?? 180;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: MODE SISTEM */}
      <Card className="p-4 border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mode Sistem</p>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isMaintenance ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
            />
            <span className="text-sm font-semibold text-slate-800">
              {isMaintenance ? "Pemeliharaan (Maintenance)" : "Normal (Online)"}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Activity className="w-5 h-5 text-indigo-600" />
        </div>
      </Card>

      {/* CARD 2: STORAGE DRIVER */}
      <Card className="p-4 border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Storage Driver
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-800">{storageDriver}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <HardDrive className="w-5 h-5 text-blue-600" />
        </div>
      </Card>

      {/* CARD 3: KEBIJAKAN INTEGRITAS */}
      <Card className="p-4 border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Kebijakan Integritas
          </p>
          <Badge color={isBinaryEnforced ? "success" : "warning"}>
            {isBinaryEnforced ? "SHA-256 Enforced (#39)" : "Opsional"}
          </Badge>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
      </Card>

      {/* CARD 4: RETENSI LOG VALIDASI */}
      <Card className="p-4 border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Retensi Log Validasi
          </p>
          <span className="text-sm font-semibold text-slate-800">{retentionDays} Hari Aktif</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Database className="w-5 h-5 text-purple-600" />
        </div>
      </Card>
    </div>
  );
}
