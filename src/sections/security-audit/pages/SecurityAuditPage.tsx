"use client";

import type { FC } from "react";
import { SecurityAuditOrganism } from "../organisms/SecurityAuditOrganism";

export const SecurityAuditPage: FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <nav className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
          <span>Dasbor</span>
          <span>/</span>
          <span>Audit & Keamanan</span>
          <span>/</span>
          <span className="text-blue-600">Security Audit & Admin Trail</span>
        </nav>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Security Audit & Riwayat Tindakan Administrator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pemantauan terpusat perubahan konfigurasi, pencabutan lisensi, reset HWID, dan deteksi
          percobaan login mencurigakan
        </p>
      </div>

      {/* Main Organism Content */}
      <SecurityAuditOrganism />
    </div>
  );
};

export default SecurityAuditPage;
