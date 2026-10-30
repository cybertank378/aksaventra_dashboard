"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  LicenseAdminItemDTO,
  LicenseDetailResponseDTO,
} from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import { useLicenseApi } from "@/modules/licenses/presentation/hooks/useLicenseApi";
import LicenseDetailModal from "@/sections/license-management/molecules/LicenseDetailModal";
import LicenseTableView from "@/sections/license-management/molecules/LicenseTableView";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

export default function LicenseRevocationsOrganism() {
  const { loading, licensesData, fetchLicenses, fetchLicenseDetail } = useLicenseApi();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<LicenseDetailResponseDTO | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(() => {
    fetchLicenses({
      page: currentPage,
      limit: 10,
      status: "SUSPENDED",
    });
  }, [fetchLicenses, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Blacklist & Revokasi Lisensi</h1>
          <p className="text-sm text-slate-500">
            Daftar serial key yang dibekukan atau ditangguhkan akibat pelanggaran integritas engine
            maupun berakhirnya masa sewa
          </p>
        </div>

        <Button
          variant="outline"
          color="secondary"
          leftIcon={RefreshCw}
          onClick={handleRefresh}
          disabled={loading}
        >
          Segarkan
        </Button>
      </div>

      <Card className="space-y-4 border-slate-200/90 bg-white p-6 shadow-sm">
        <LicenseTableView
          items={items}
          currentPage={pagination.page}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          loading={loading}
          onPageChange={handlePageChange}
          onInspectLicense={handleInspectLicense}
        />
      </Card>

      <LicenseDetailModal
        open={detailModalOpen}
        license={selectedDetail}
        loading={detailLoading}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
