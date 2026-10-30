"use client";

import { Eye, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import type { UserRole } from "@/libs/enums";
import Card from "@/shared-ui/component/Card";

interface RolePermissionSummaryBoxProps {
  role: UserRole;
  className?: string;
}

export const RolePermissionSummaryBox = ({ role, className }: RolePermissionSummaryBoxProps) => {
  const getRoleDetails = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return {
          title: "Administrator Penuh",
          badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          description:
            "Akses kontrol penuh ke modul User Management, License Generation & HWID Reset, Engine Registry & Release, serta Audit Log Keamanan.",
          permissions: [
            "Kelola akun & hak akses semua pengguna",
            "Generate & suspend lisensi mesin",
            "Reset HWID mesin klien",
            "Publish rilis update aksaventra_engine.exe",
          ],
        };
      case "OPERATOR":
        return {
          title: "Sistem Operator",
          badgeColor: "text-blue-700 bg-blue-50 border-blue-200",
          icon: <ShieldAlert className="w-5 h-5 text-blue-600" />,
          description:
            "Akses operasional harian: pantau telemetri validasi mesin dan download rilis engine yang terpublikasi.",
          permissions: [
            "Lihat direktori lisensi (Read-Only)",
            "Pantau log validasi & uptime mesin",
            "Dilarang membuat lisensi & mereset HWID",
            "Dilarang mengelola akun pengguna",
          ],
        };
      case "AUDITOR":
        return {
          title: "Security & QA Auditor",
          badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
          icon: <Eye className="w-5 h-5 text-amber-600" />,
          description:
            "Akses read-only khusus audit kepatuhan, histori jejak mutasi lisensi, investigasi anomali HWID mismatch, dan verifikasi checksum SHA-256.",
          permissions: [
            "Audit seluruh log aktivitas pengguna & sistem",
            "Investigasi kegagalan validasi mesin klien",
            "Verifikasi integritas binary & signature",
            "Akses murni Read-Only tanpa hak mutasi",
          ],
        };
      case "CLIENT":
        return {
          title: "Klien / Pemilik Lisensi",
          badgeColor: "text-purple-700 bg-purple-50 border-purple-200",
          icon: <UserCheck className="w-5 h-5 text-purple-600" />,
          description:
            "Akses portal pelanggan untuk memeriksa serial key, status aktivasi, dan masa berlaku lisensi yang dimiliki.",
          permissions: [
            "Lihat informasi lisensi yang dimiliki",
            "Pantau masa kedaluwarsa lisensi",
            "Dilarang mengakses log validasi sistem",
            "Akses murni Read-Only terbatas pada portal klien",
          ],
        };
    }
  };

  const details = getRoleDetails(role);

  return (
    <Card className={`p-4 border border-slate-200/80 bg-slate-50/50 rounded-xl ${className || ""}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm shrink-0">
          {details.icon}
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-800">{details.title}</h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${details.badgeColor}`}
            >
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{details.description}</p>
          <ul className="pt-1.5 space-y-1">
            {details.permissions.map((perm) => (
              <li key={perm} className="flex items-center gap-1.5 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>{perm}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
