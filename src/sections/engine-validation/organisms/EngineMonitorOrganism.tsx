"use client";

import { useEffect, useState } from "react";
import { useEngineMonitorApi } from "@/modules/engine-validation/presentation/hooks/useEngineMonitorApi";
import type { LiveFeedGroup } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";
import EngineHealthOverviewRow from "@/sections/engine-validation/molecules/EngineHealthOverviewRow";
import EngineMonitorKpiGrid from "@/sections/engine-validation/molecules/EngineMonitorKpiGrid";
import EngineValidationSimulatorModal from "@/sections/engine-validation/molecules/EngineValidationSimulatorModal";
import LiveStreamControlBar from "@/sections/engine-validation/molecules/LiveStreamControlBar";
import LiveValidationFeedTableView from "@/sections/engine-validation/molecules/LiveValidationFeedTableView";

export default function EngineMonitorOrganism() {
  const {
    loading,
    isPaused,
    pollIntervalMs,
    summary,
    feedData,
    setPollIntervalMs,
    togglePause,
    getSummary,
    getFeed,
    verifyChecksum,
    simulateValidation,
  } = useEngineMonitorApi();

  const [activeGroup, setActiveGroup] = useState<LiveFeedGroup>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initial fetch
  useEffect(() => {
    getSummary();
    getFeed({ page: 1, limit: 20, group: activeGroup, search });
  }, [getSummary, getFeed, activeGroup, search]);

  // Polling stream interval
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      getSummary();
      getFeed({ page, limit: 20, group: activeGroup, search });
    }, pollIntervalMs);

    return () => clearInterval(timer);
  }, [isPaused, pollIntervalMs, page, activeGroup, search, getSummary, getFeed]);

  const handleTogglePause = () => {
    togglePause();
  };

  const handleIntervalChange = (interval: number) => {
    setPollIntervalMs(interval);
  };

  const handleGroupFilterChange = (group: LiveFeedGroup) => {
    setActiveGroup(group);
    setPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearch(term);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getSummary(), getFeed({ page, limit: 20, group: activeGroup, search })]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (Pause/Resume, Interval, Simulator) */}
      <LiveStreamControlBar
        isPaused={isPaused}
        pollIntervalMs={pollIntervalMs}
        refreshing={refreshing}
        onTogglePause={handleTogglePause}
        onIntervalChange={handleIntervalChange}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onManualRefresh={handleManualRefresh}
      />

      {/* 4 Kartu KPI Live Monitor */}
      <EngineMonitorKpiGrid summary={summary} loading={loading} />

      {/* Baris Distribusi Hasil & Kepatuhan Versi Klien */}
      <EngineHealthOverviewRow summary={summary} />

      {/* Tabel Live Telemetry Feed */}
      <LiveValidationFeedTableView
        items={feedData?.items ?? []}
        totalItems={feedData?.pagination.totalItems ?? 0}
        page={feedData?.pagination.page ?? page}
        limit={feedData?.pagination.limit ?? 20}
        totalPages={feedData?.pagination.totalPages ?? 1}
        activeGroup={activeGroup}
        search={search}
        loading={loading}
        onGroupChange={handleGroupFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
      />

      {/* Modal Simulator & Verifikator Checksum */}
      <EngineValidationSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulateValidate={simulateValidation}
        onVerifyChecksum={verifyChecksum}
      />
    </div>
  );
}
