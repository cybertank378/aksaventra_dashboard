"use client";

import { Activity } from "lucide-react";
import EngineIntegrityOrganism from "@/sections/engine-validation/organisms/EngineIntegrityOrganism";
import Badge from "@/shared-ui/component/Badge";
import LinkButton from "@/shared-ui/component/LinkButton";

export default function EngineIntegrityPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integritas Biner Engine (SHA-256)</h1>
          <p className="text-sm text-slate-500">
            Audit keamanan dan verifikasi hash biner aksaventra_engine.exe sesuai standar kepatuhan
            Isu #39
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <LinkButton
            href="/dashboard/engine/monitor"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Activity}
          >
            Live Monitor Telemetri
          </LinkButton>

          <Badge color="info" variant="soft">
            Standar Isu #39 Aktif
          </Badge>
        </div>
      </div>

      {/* Main Organism */}
      <EngineIntegrityOrganism />
    </div>
  );
}
