"use client";

import { ShieldCheck } from "lucide-react";
import EngineMonitorOrganism from "@/sections/engine-validation/organisms/EngineMonitorOrganism";
import Badge from "@/shared-ui/component/Badge";
import LinkButton from "@/shared-ui/component/LinkButton";

export default function EngineMonitorPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Engine Validation Monitor</h1>
          <p className="text-sm text-slate-500">
            Pemantauan telemetri real-time otentikasi HWID dan latensi API aksaventra_engine.exe
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
            Integritas Biner (SHA-256)
          </LinkButton>

          <Badge color="success" variant="soft">
            Endpoint /api/v1/validate Aktif
          </Badge>
        </div>
      </div>

      {/* Main Organism */}
      <EngineMonitorOrganism />
    </div>
  );
}
