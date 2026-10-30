"use client";

import type { LicenseValidationResult } from "@prisma/client";
import { useEffect, useState } from "react";
import type { ValidationLogItemDTO } from "@/modules/validation-logs/domain/dto/ValidationLogResponseDTO";
import type { ValidationLogFilterGroup } from "@/modules/validation-logs/domain/types/ValidationLogFilterGroup";
import { useValidationLogApi } from "@/modules/validation-logs/presentation/hooks/useValidationLogApi";
import Card from "@/shared-ui/component/Card";
import Pagination from "@/shared-ui/component/Pagination";
import { ValidationLogDetailModal } from "../molecules/ValidationLogDetailModal";
import { ValidationLogFilterBar } from "../molecules/ValidationLogFilterBar";
import { ValidationLogStatsGrid } from "../molecules/ValidationLogStatsGrid";
import { ValidationLogsTableView } from "../molecules/ValidationLogsTableView";

export const ValidationLogsDirectoryOrganism = () => {
  const { loading, logs, stats, activeDetail, fetchLogs, fetchStats, fetchDetail, exportLogs } =
    useValidationLogApi();

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<ValidationLogFilterGroup>("ALL");
  const [resultFilter, setResultFilter] = useState<LicenseValidationResult | undefined>(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStats().catch(() => {});
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs({
      page,
      limit,
      search: search.trim() || undefined,
      group,
      result: resultFilter,
    }).catch(() => {});
  }, [fetchLogs, page, limit, search, group, resultFilter]);

  /* ==========================================================
   * NAMED EVENT HANDLERS
   * ======================================================== */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleGroupChange = (newGroup: ValidationLogFilterGroup) => {
    setGroup(newGroup);
    setPage(1);
  };

  const handleResultFilterChange = (newResult?: LicenseValidationResult) => {
    setResultFilter(newResult);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setGroup("ALL");
    setResultFilter(undefined);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchStats().catch(() => {});
    fetchLogs({
      page,
      limit,
      search: search.trim() || undefined,
      group,
      result: resultFilter,
    }).catch(() => {});
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleInspectLog = async (item: ValidationLogItemDTO) => {
    setIsModalOpen(true);
    await fetchDetail(item.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleExport = () => {
    exportLogs({
      search: search.trim() || undefined,
      group,
      result: resultFilter,
      format: "csv",
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkasan Halaman */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Log Validasi Mesin
          </h2>
          <p className="text-xs text-slate-500">
            Audit telemetri otentikasi lisensi klien binary aksaventra_engine.exe secara real-time.
          </p>
        </div>
      </div>

      {/* 2. 4 Kartu KPI Metrik */}
      <ValidationLogStatsGrid stats={stats} loading={loading && !stats} />

      {/* 3. Kartu Utama Tabel Log & Filter */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <ValidationLogFilterBar
          search={search}
          onSearchChange={handleSearchChange}
          group={group}
          onGroupChange={handleGroupChange}
          resultFilter={resultFilter}
          onResultFilterChange={handleResultFilterChange}
          onResetFilters={handleResetFilters}
          onRefresh={handleRefresh}
          onExport={handleExport}
          loading={loading}
        />

        <ValidationLogsTableView
          logs={logs?.logs ?? []}
          loading={loading && !logs}
          onInspect={handleInspectLog}
        />

        {logs && logs.pagination.total > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={page}
              totalItems={logs.pagination.total}
              itemsPerPage={limit}
              onPageChangeAction={handlePageChange}
            />
          </div>
        )}
      </Card>

      {/* 4. Modal Detail Inspeksi */}
      <ValidationLogDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        detail={activeDetail}
        loading={loading && !activeDetail}
      />
    </div>
  );
};
