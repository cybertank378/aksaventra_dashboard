"use client";

import { Cpu, Filter, KeyRound, PlusCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useLicenseApi } from "@/modules/licenses/presentation/hooks/useLicenseApi";
import LicenseMetricCard from "@/sections/license-management/atomic/LicenseMetricCard";
import type { LicenseDisplayStatus } from "@/sections/license-management/atomic/LicenseStatusBadge";
import DeviceResetModal from "@/sections/license-management/molecules/DeviceResetModal";
import LicenseFilterModal from "@/sections/license-management/molecules/LicenseFilterModal";
import LicenseTableView, {
  type LicenseItemViewModel,
  type LicenseTier,
} from "@/sections/license-management/molecules/LicenseTableView";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import FilterBar from "@/shared-ui/component/FilterBar";
import LinkButton from "@/shared-ui/component/LinkButton";
import SearchField from "@/shared-ui/component/SearchField";

const INITIAL_LICENSES: LicenseItemViewModel[] = [
  {
    id: "lic-001",
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
    id: "lic-002",
    serialKey: "AKSA-PRO-2026-4C8B",
    clientName: "Politeknik Negeri Nusantara",
    tier: "PRO",
    hwid: "HWID-SRV22-KL10-3321",
    engineVersion: "v1.4.2",
    status: "ACTIVE",
    expiresAt: "2027-08-15",
    lastVerifiedAt: "Hari ini, 14:12 WIB",
  },
  {
    id: "lic-003",
    serialKey: "AKSA-TRIAL-2026-1D5E",
    clientName: "Laboratorium Riset Mandiri",
    tier: "TRIAL",
    hwid: null,
    engineVersion: "v1.4.0",
    status: "ACTIVE",
    expiresAt: "2026-11-28",
    lastVerifiedAt: "Belum diaktivasi",
  },
  {
    id: "lic-004",
    serialKey: "AKSA-PRO-2025-8A1C",
    clientName: "Institut Teknologi Mitra",
    tier: "PRO",
    hwid: "HWID-LEGACY-9920-0011",
    engineVersion: "v1.3.8",
    status: "REVOKED",
    expiresAt: "2026-05-01",
    lastVerifiedAt: "Dicabut oleh Admin",
  },
];

export default function LicenseDirectoryOrganism() {
  const { loading } = useLicenseApi();

  const [licenses, setLicenses] = useState<LicenseItemViewModel[]>(INITIAL_LICENSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LicenseDisplayStatus | "ALL">("ALL");
  const [tierFilter, setTierFilter] = useState<LicenseTier | "ALL">("ALL");
  const [hwidBoundOnly, setHwidBoundOnly] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedForReset, setSelectedForReset] = useState<LicenseItemViewModel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLicenses = useMemo(() => {
    return licenses.filter((item) => {
      const matchesQuery =
        !searchQuery.trim() ||
        item.serialKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hwid?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesTier = tierFilter === "ALL" || item.tier === tierFilter;
      const matchesHwid = !hwidBoundOnly || Boolean(item.hwid);

      return matchesQuery && matchesStatus && matchesTier && matchesHwid;
    });
  }, [licenses, searchQuery, statusFilter, tierFilter, hwidBoundOnly]);

  const handleConfirmResetHwid = (target: LicenseItemViewModel) => {
    setLicenses((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              hwid: null,
              lastVerifiedAt: "HWID direset oleh Admin",
            }
          : item,
      ),
    );
    setSelectedForReset(null);
  };

  const handleRevokeLicense = (target: LicenseItemViewModel) => {
    setLicenses((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: "REVOKED",
              lastVerifiedAt: "Dicabut oleh Admin",
            }
          : item,
      ),
    );
  };

  const activeCount = licenses.filter((l) => l.status === "ACTIVE").length;
  const boundCount = licenses.filter((l) => Boolean(l.hwid)).length;
  const revokedCount = licenses.filter((l) => l.status === "REVOKED").length;

  return (
    <div className="space-y-6">
      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LicenseMetricCard
          title="Total Lisensi"
          value={licenses.length}
          subtitle="Terdaftar di database"
          badgeText="Semua Tier"
          badgeColor="primary"
          icon={KeyRound}
        />
        <LicenseMetricCard
          title="Lisensi Aktif"
          value={activeCount}
          subtitle="Siap melayani aksaventra_engine"
          badgeText="Valid"
          badgeColor="success"
          icon={ShieldCheck}
        />
        <LicenseMetricCard
          title="Perangkat Terikat"
          value={boundCount}
          subtitle="Terkunci dengan HWID mesin"
          badgeText="HWID Locked"
          badgeColor="info"
          icon={Cpu}
        />
        <LicenseMetricCard
          title="Dicabut / Blacklist"
          value={revokedCount}
          subtitle="Akses engine diblokir"
          badgeText="Revoked"
          badgeColor="error"
          icon={ShieldAlert}
        />
      </div>

      {/* FILTER & DIRECTORY TABLE */}
      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Direktori Semua Lisensi</h2>
            <p className="text-sm text-slate-500">
              Kelola status serial key, ikatan perangkat keras (HWID), dan masa berlaku lisensi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LinkButton
              href="/dashboard/licenses/revocations"
              variant="outline"
              color="error"
              leftIcon={ShieldAlert}
            >
              Blacklist & Revokasi
            </LinkButton>

            <Button
              variant="outline"
              color="secondary"
              leftIcon={Filter}
              onClick={() => setFilterModalOpen(true)}
            >
              Filter Lanjutan
            </Button>

            <LinkButton
              href="/dashboard/licenses/create"
              variant="filled"
              color="primary"
              leftIcon={PlusCircle}
            >
              Terbitkan Lisensi
            </LinkButton>
          </div>
        </div>

        <FilterBar resultCount={filteredLicenses.length}>
          <SearchField
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari Serial Key, Nama Instansi, atau HWID..."
            className="w-full md:w-96"
          />
        </FilterBar>

        <LicenseTableView
          items={filteredLicenses}
          currentPage={currentPage}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
          onRequestResetHwid={(item) => setSelectedForReset(item)}
          onRequestRevoke={loading ? undefined : handleRevokeLicense}
        />
      </Card>

      {/* FILTER MODAL */}
      <LicenseFilterModal
        open={filterModalOpen}
        statusFilter={statusFilter}
        tierFilter={tierFilter}
        hwidBoundOnly={hwidBoundOnly}
        onChangeStatus={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
        onChangeTier={(tier) => {
          setTierFilter(tier);
          setCurrentPage(1);
        }}
        onChangeHwidBound={(bound) => {
          setHwidBoundOnly(bound);
          setCurrentPage(1);
        }}
        onReset={() => {
          setStatusFilter("ALL");
          setTierFilter("ALL");
          setHwidBoundOnly(false);
          setCurrentPage(1);
        }}
        onClose={() => setFilterModalOpen(false)}
      />

      {/* DEVICE RESET MODAL */}
      <DeviceResetModal
        open={Boolean(selectedForReset)}
        license={selectedForReset}
        onClose={() => setSelectedForReset(null)}
        onConfirmReset={handleConfirmResetHwid}
      />
    </div>
  );
}
