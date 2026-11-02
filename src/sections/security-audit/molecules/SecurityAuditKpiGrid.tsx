import { AlertOctagon, AlertTriangle, FileText, ShieldCheck } from "lucide-react";
import type { FC } from "react";
import type { SecurityAuditSummaryDTO } from "@/modules/auth/domain/dto/SecurityAuditDTO";
import Card from "@/shared-ui/component/Card";

interface SecurityAuditKpiGridProps {
  summary: SecurityAuditSummaryDTO;
}

export const SecurityAuditKpiGrid: FC<SecurityAuditKpiGridProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Aksi Admin */}
      <Card className="p-5 border border-slate-200/90 shadow-xs bg-white rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Aksi Admin (30H)
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary.totalAdminActions30d}{" "}
            <span className="text-xs font-semibold text-slate-500">Aksi</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tercatat di audit_logs</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <FileText size={20} />
        </div>
      </Card>

      {/* 2. Login Sukses (24J) */}
      <Card className="p-5 border border-slate-200/90 shadow-xs bg-white rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Login Sukses (24J)
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {summary.loginSuccess24h}{" "}
            <span className="text-xs font-semibold text-slate-500">Sesi</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tercatat di login_audits</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <ShieldCheck size={20} />
        </div>
      </Card>

      {/* 3. Login Gagal / Brute-Force */}
      <Card className="p-5 border border-slate-200/90 shadow-xs bg-white rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Login Gagal / Brute-Force
          </p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {summary.loginFailedAttempts}{" "}
            <span className="text-xs font-semibold text-slate-500">Percobaan</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Deteksi anomali login</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <AlertTriangle size={20} />
        </div>
      </Card>

      {/* 4. Mutasi Kritis */}
      <Card className="p-5 border border-slate-200/90 shadow-xs bg-white rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Mutasi Kritis (Revoke/Reset)
          </p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {summary.criticalMutationsCount}{" "}
            <span className="text-xs font-semibold text-slate-500">Kejadian</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Reset Perangkat & Suspend Lisensi</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
          <AlertOctagon size={20} />
        </div>
      </Card>
    </div>
  );
};
