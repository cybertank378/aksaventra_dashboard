"use client";

import { Activity, AlertTriangle, Cpu, RefreshCw, Server } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  LicenseAdminItemDTO,
  LicenseDetailResponseDTO,
} from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import { useLicenseApi } from "@/modules/licenses/presentation/hooks/useLicenseApi";
import LicenseMetricCard from "@/sections/license-management/atomic/LicenseMetricCard";
import BoundDevicesTableView from "@/sections/license-management/molecules/BoundDevicesTableView";
import DeviceResetModal from "@/sections/license-management/molecules/DeviceResetModal";
import LicenseDetailModal from "@/sections/license-management/molecules/LicenseDetailModal";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import LinkButton from "@/shared-ui/component/LinkButton";
import SearchField from "@/shared-ui/component/SearchField";

type DeviceFilterTab = "BOUND" | "UNBOUND" | "ALL";

export default function BoundDevicesOrganism() {
  const {
    loading,
    licensesData,
    statsData,
    fetchLicenses,
    fetchStats,
    fetchLicenseDetail,
    resetDeviceHwid,
  } = useLicenseApi();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DeviceFilterTab>("BOUND");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedForReset, setSelectedForReset] = useState<LicenseAdminItemDTO | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<LicenseDetailResponseDTO | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(() => {
    fetchStats();

    fetchLicenses({
      page: currentPage,
      limit: 10,
      search: searchQuery.trim() || undefined,
      binding: activeTab,
    });
  }, [fetchLicenses, fetchStats, currentPage, searchQuery, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Named event handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: DeviceFilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefreshData = () => {
    loadData();
  };

  const handleOpenResetModal = (target: LicenseAdminItemDTO) => {
    setSelectedForReset(target);
  };

  const handleCloseResetModal = () => {
    setSelectedForReset(null);
  };

  const handleConfirmResetHwid = async (target: LicenseAdminItemDTO, reason?: string) => {
    await resetDeviceHwid(target.id, reason);
    setSelectedForReset(null);
    loadData();
  };

  const handleInspectLicense = async (target: LicenseAdminItemDTO) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const detail = await fetchLicenseDetail(target.id);
      setSelectedDetail(detail);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedDetail(null);
  };

  const items = licensesData?.licenses ?? [];
  const pagination = licensesData?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Perangkat Terikat (HWID Locking)
          </h1>
          <p className="text-sm text-slate-500">
            Manajemen penguncian mesin klien aksaventra_engine.exe dan pelepasan ikatan hardware
            saat terjadi migrasi perangkat keras
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            color="secondary"
            leftIcon={RefreshCw}
            onClick={handleRefreshData}
            disabled={loading}
          >
            Segarkan
          </Button>

          <LinkButton href="/dashboard/licenses" variant="outline" color="secondary">
            Lihat Semua Lisensi
          </LinkButton>
        </div>
      </div>

      {/* 4 KPI CARDS FOR DEVICES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LicenseMetricCard
          title="Perangkat Terikat (HWID)"
          value={statsData?.boundDevicesCount ?? 0}
          subtitle="Mesin aktif terkunci ke lisensi"
          badgeText="Terkunci"
          badgeColor="info"
          icon={Cpu}
        />
        <LicenseMetricCard
          title="Menunggu Aktivasi Pertama"
          value={statsData?.unboundActiveCount ?? 0}
          subtitle="Lisensi aktif belum mengikat mesin"
          badgeText="Slot Tersedia"
          badgeColor="primary"
          icon={Server}
        />
        <LicenseMetricCard
          title="Terkoneksi 24 Jam Terakhir"
          value={statsData?.verifiedLast24hCount ?? 0}
          subtitle="Heartbeat validasi berhasil"
          badgeText="Online"
          badgeColor="success"
          icon={Activity}
        />
        <LicenseMetricCard
          title="Anomali HWID Mismatch"
          value={statsData?.hwidMismatchLast24hCount ?? 0}
          subtitle="Percobaan 403 Forbidden 24 Jam"
          badgeText="Peringatan"
          badgeColor={statsData?.hwidMismatchLast24hCount ? "error" : "secondary"}
          icon={AlertTriangle}
        />
      </div>

      {/* MAIN CARD WITH TABLE */}
      <Card className="space-y-5 border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => handleTabChange("BOUND")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === "BOUND"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hanya Perangkat Terikat
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("UNBOUND")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === "UNBOUND"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Menunggu Aktivasi (Unbound)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("ALL")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua Lisensi
            </button>
          </div>

          <SearchField
            placeholder="Cari berdasarkan HWID, nama klien, atau serial key..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-80"
          />
        </div>

        <BoundDevicesTableView
          items={items}
          currentPage={pagination.page}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          loading={loading}
          onPageChange={handlePageChange}
          onRequestResetHwid={handleOpenResetModal}
          onInspectLicense={handleInspectLicense}
        />
      </Card>

      {/* DEVICE RESET MODAL */}
      <DeviceResetModal
        open={Boolean(selectedForReset)}
        license={selectedForReset}
        loading={loading}
        onClose={handleCloseResetModal}
        onConfirmReset={handleConfirmResetHwid}
      />

      {/* DETAIL MODAL */}
      <LicenseDetailModal
        open={detailModalOpen}
        license={selectedDetail}
        loading={detailLoading}
        onClose={handleCloseDetailModal}
        onRequestResetHwid={(id) => {
          const target = items.find((l) => l.id === id);
          if (target) {
            setDetailModalOpen(false);
            setSelectedForReset(target);
          }
        }}
      />
    </div>
  );
}
