"use client";

import { useState } from "react";
import DeviceResetModal from "@/sections/license-management/molecules/DeviceResetModal";
import LicenseTableView, {
  type LicenseItemViewModel,
} from "@/sections/license-management/molecules/LicenseTableView";
import Card from "@/shared-ui/component/Card";

const BOUND_DEVICES_INITIAL: LicenseItemViewModel[] = [
  {
    id: "dev-001",
    serialKey: "AKSA-ENTERPRISE-2026-9F2A",
    clientName: "Universitas Aksaventra Pusat",
    tier: "ENTERPRISE",
    hwid: "HWID-WIN11-AX98-7712",
    engineVersion: "v1.4.2",
    status: "ACTIVE",
    expiresAt: "2027-10-28",
    lastVerifiedAt: "Hari ini, 16:40 WIB",
  },
  {
    id: "dev-002",
    serialKey: "AKSA-PRO-2026-4C8B",
    clientName: "Politeknik Negeri Nusantara",
    tier: "PRO",
    hwid: "HWID-SRV22-KL10-3321",
    engineVersion: "v1.4.2",
    status: "ACTIVE",
    expiresAt: "2027-08-15",
    lastVerifiedAt: "Hari ini, 14:12 WIB",
  },
];

export default function BoundDevicesOrganism() {
  const [devices, setDevices] = useState<LicenseItemViewModel[]>(BOUND_DEVICES_INITIAL);
  const [selectedDevice, setSelectedDevice] = useState<LicenseItemViewModel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleResetHwid = (target: LicenseItemViewModel) => {
    setDevices((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              hwid: null,
              lastVerifiedAt: "Ikatan HWID dilepas",
            }
          : item,
      ),
    );
    setSelectedDevice(null);
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Perangkat Terikat (HWID Locking)</h1>
          <p className="text-sm text-slate-500">
            Manajemen penguncian mesin klien aksaventra_engine dan reset binding apabila terjadi
            pergantian perangkat keras
          </p>
        </div>

        <LicenseTableView
          items={devices}
          currentPage={currentPage}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
          onRequestResetHwid={(item) => setSelectedDevice(item)}
        />
      </Card>

      <DeviceResetModal
        open={Boolean(selectedDevice)}
        license={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onConfirmReset={handleResetHwid}
      />
    </div>
  );
}

