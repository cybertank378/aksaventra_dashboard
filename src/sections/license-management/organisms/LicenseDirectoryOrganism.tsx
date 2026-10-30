"use client";

import {
  Cpu,
  Filter,
  KeyRound,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  LicenseAdminItemDTO,
  LicenseDetailResponseDTO,
} from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import { useLicenseApi } from "@/modules/licenses/presentation/hooks/useLicenseApi";
import LicenseMetricCard from "@/sections/license-management/atomic/LicenseMetricCard";
import DeviceResetModal from "@/sections/license-management/molecules/DeviceResetModal";
import LicenseDetailModal from "@/sections/license-management/molecules/LicenseDetailModal";
import LicenseTableView from "@/sections/license-management/molecules/LicenseTableView";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import LinkButton from "@/shared-ui/component/LinkButton";
import SearchField from "@/shared-ui/component/SearchField";

type StatusTab = "ALL" | "ACTIVE" | "EXPIRING_SOON" | "INACTIVE";

export default function LicenseDirectoryOrganism() {
  const {
    loading,
    licensesData,
    statsData,
    fetchLicenses,
    fetchStats,
    fetchLicenseDetail,
    resetDeviceHwid,
    updateLicenseStatus,
  } = useLicenseApi();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [hwidBoundOnly, setHwidBoundOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedForReset, setSelectedForReset] = useState<LicenseAdminItemDTO | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<LicenseDetailResponseDTO | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load stats & licenses on mount and when filters change
  const loadData = useCallback(() => {
    fetchStats();

    let statusParam: "ALL" | "ACTIVE" | "EXPIRED" | "SUSPENDED" | undefined;
    let expiringSoonParam: boolean | undefined;

    if (activeTab === "ACTIVE") {
      statusParam = "ACTIVE";
    } else if (activeTab === "EXPIRING_SOON") {
      expiringSoonParam = true;
    } else if (activeTab === "INACTIVE") {
      statusParam = "SUSPENDED";
    }

    fetchLicenses({
      page: currentPage,
      limit: 10,
      search: searchQuery.trim() || undefined,
      status: statusParam,
      binding: hwidBoundOnly ? "BOUND" : "ALL",
      expiringSoon: expiringSoonParam,
    });
  }, [fetchLicenses, fetchStats, currentPage, searchQuery, activeTab, hwidBoundOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Named event handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: StatusTab) => {
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

  const handleRevokeLicense = async (target: LicenseAdminItemDTO) => {
    if (confirm(`Apakah Anda yakin ingin membekukan lisensi untuk ${target.clientName}?`)) {
      await updateLicenseStatus(target.id, {
        status: "SUSPENDED",
        reason: "Dibekukan manual oleh Admin via direktori",
      });
      loadData();
    }
  };

  const licenses = licensesData?.licenses ?? [];
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
            Direktori & Manajemen Lisensi
          </h1>
          <p className="text-sm text-slate-500">
            Pemantauan kuota perangkat, masa berlaku paket, dan penerbitan serial key
            aksaventra_engine.exe
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

          <LinkButton
            href="/dashboard/licenses/create"
            variant="filled"
            color="primary"
            leftIcon={PlusCircle}
          >
            Terbitkan Lisensi Baru
          </LinkButton>
        </div>
      </div>

      {/* 4 METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LicenseMetricCard
          title="Total Lisensi"
          value={statsData?.totalLicenses ?? 0}
          subtitle="Terdaftar di database PostgreSQL"
          badgeText="Semua Lisensi"
          badgeColor="primary"
          icon={KeyRound}
        />
        <LicenseMetricCard
          title="Lisensi Aktif"
          value={statsData?.activeLicenses ?? 0}
          subtitle="Siap melayani aksaventra_engine"
          badgeText="Valid"
          badgeColor="success"
          icon={ShieldCheck}
        />
        <LicenseMetricCard
          title="Perangkat Terikat"
          value={statsData?.boundDevicesCount ?? 0}
          subtitle="Terkunci ke Hardware ID (HWID)"
          badgeText="HWID Bound"
          badgeColor="info"
          icon={Cpu}
        />
        <LicenseMetricCard
          title="Kedaluwarsa / Dibekukan"
          value={statsData?.expiredOrSuspendedLicenses ?? 0}
          subtitle="Perlu perpanjangan atau aktivasi"
          badgeText="Nonaktif"
          badgeColor="error"
          icon={ShieldAlert}
        />
      </div>

      {/* MAIN TABLE CONTAINER */}
      <Card className="space-y-5 border-slate-200/90 bg-white p-6 shadow-sm">
        {/* TOOLBAR & STATUS TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs">
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
            <button
              type="button"
              onClick={() => handleTabChange("ACTIVE")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === "ACTIVE"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("EXPIRING_SOON")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === "EXPIRING_SOON"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Segera Habis (&le;30H)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("INACTIVE")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === "INACTIVE"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kedaluwarsa / Dibekukan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SearchField
              placeholder="Cari nama klien, serial key, atau HWID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-72"
            />

            <Button
              variant={hwidBoundOnly ? "filled" : "outline"}
              color={hwidBoundOnly ? "primary" : "secondary"}
              leftIcon={Filter}
              onClick={() => setHwidBoundOnly((prev) => !prev)}
              title="Filter hanya perangkat terikat HWID"
            >
              {hwidBoundOnly ? "Terikat HWID" : "Semua Binding"}
            </Button>
          </div>
        </div>

        {/* TABLE VIEW */}
        <LicenseTableView
          items={licenses}
          currentPage={pagination.page}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          loading={loading}
          onPageChange={handlePageChange}
          onRequestResetHwid={handleOpenResetModal}
          onRequestRevoke={handleRevokeLicense}
          onInspectLicense={handleInspectLicense}
        />
      </Card>

      {/* RESET HWID MODAL */}
      <DeviceResetModal
        open={Boolean(selectedForReset)}
        license={selectedForReset}
        loading={loading}
        onClose={handleCloseResetModal}
        onConfirmReset={handleConfirmResetHwid}
      />

      {/* DETAIL INSPECTION MODAL */}
      <LicenseDetailModal
        open={detailModalOpen}
        license={selectedDetail}
        loading={detailLoading}
        onClose={handleCloseDetailModal}
        onRequestResetHwid={(id) => {
          const target = licenses.find((l) => l.id === id);
          if (target) {
            setDetailModalOpen(false);
            setSelectedForReset(target);
          }
        }}
      />
    </div>
  );
}
