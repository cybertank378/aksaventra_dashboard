"use client";

import { useState } from "react";
import LicenseTableView, {
  type LicenseItemViewModel,
} from "@/sections/license-management/molecules/LicenseTableView";
import Card from "@/shared-ui/component/Card";

const REVOKED_LICENSES_INITIAL: LicenseItemViewModel[] = [
  {
    id: "rev-001",
    serialKey: "AKSA-PRO-2025-8A1C",
    clientName: "Institut Teknologi Mitra",
    tier: "PRO",
    hwid: "HWID-LEGACY-9920-0011",
    engineVersion: "v1.3.8",
    status: "REVOKED",
    expiresAt: "2026-05-01",
    lastVerifiedAt: "Pelanggaran integritas SHA-256",
  },
  {
    id: "rev-002",
    serialKey: "AKSA-TRIAL-2025-3B9D",
    clientName: "Klien Evaluasi Eksternal",
    tier: "TRIAL",
    hwid: "HWID-TEST-4410-8821",
    engineVersion: "v1.3.5",
    status: "EXPIRED",
    expiresAt: "2026-01-15",
    lastVerifiedAt: "Masa sewa berakhir",
  },
];

export default function LicenseRevocationsOrganism() {
  const [items] = useState<LicenseItemViewModel[]>(REVOKED_LICENSES_INITIAL);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Blacklist & Revokasi Lisensi</h1>
          <p className="text-sm text-slate-500">
            Daftar serial key yang dibekukan atau dicabut permanen akibat pelanggaran integritas
            engine maupun berakhirnya masa sewa
          </p>
        </div>

        <LicenseTableView
          items={items}
          currentPage={currentPage}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
