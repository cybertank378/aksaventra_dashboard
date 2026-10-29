"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useReleaseApi } from "@/modules/releases/presentation/hooks/useReleaseApi";
import { ReleaseStatsCards } from "@/sections/releases/molecules/ReleaseStatsCards";
import { ReleaseTableView } from "@/sections/releases/molecules/ReleaseTableView";
import { ReleaseUpdateLogsView } from "@/sections/releases/molecules/ReleaseUpdateLogsView";
import { ReleaseUploadModal } from "@/sections/releases/molecules/ReleaseUploadModal";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import ToggleGroup from "@/shared-ui/component/ToggleGroup";

export const ReleaseManagementOrganism: React.FC = () => {
  const {
    loading,
    error,
    releases,
    stats,
    logs,
    fetchReleases,
    fetchStats,
    fetchLogs,
    createRelease,
    toggleRelease,
    deleteRelease,
  } = useReleaseApi();

  const [activeTab, setActiveTab] = useState<string>("releases");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchReleases();
    fetchLogs();
  }, [fetchStats, fetchReleases, fetchLogs]);

  const handleFilterChannel = (channel: string) => {
    setChannelFilter(channel);
    fetchReleases({
      channel: channel === "ALL" ? undefined : channel,
      search: searchQuery || undefined,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchReleases({
      channel: channelFilter === "ALL" ? undefined : channelFilter,
      search: query || undefined,
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleRelease(id, !currentStatus);
    fetchReleases({
      channel: channelFilter === "ALL" ? undefined : channelFilter,
      search: searchQuery || undefined,
    });
    fetchStats();
  };

  const handleDeleteRelease = async (id: string, version: string) => {
    if (
      confirm(`Apakah Anda yakin ingin menghapus rilis versi ${version}? Tindakan ini permanen.`)
    ) {
      await deleteRelease(id);
      fetchReleases({
        channel: channelFilter === "ALL" ? undefined : channelFilter,
        search: searchQuery || undefined,
      });
      fetchStats();
    }
  };

  const handleCreateRelease = async (formData: FormData) => {
    await createRelease(formData);
    fetchReleases();
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Manajemen Rilis & Auto-Updater Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              v2.2.1+
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola distribusi biner portabel aksaventra_engine.exe, versi wajib, dan telemetri
            pembaruan perangkat
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            color="secondary"
            size="md"
            onClick={() => {
              fetchStats();
              fetchReleases();
              fetchLogs();
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>

          <Button
            variant="filled"
            color="primary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Unggah Rilis Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ReleaseStatsCards stats={stats} loading={loading} />

      {/* Main Content Area */}
      <Card className="p-6 border border-slate-200/90 shadow-sm rounded-2xl bg-white space-y-5">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <ToggleGroup
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            options={[
              { label: "Daftar Rilis Biner", value: "releases" },
              { label: "Log Pengecekan & Unduhan", value: "logs" },
            ]}
          />

          {activeTab === "releases" && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-64">
                <TextField
                  placeholder="Cari versi / changelog..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  leftIcon={Search}
                  size="sm"
                />
              </div>

              <div className="w-full sm:w-44">
                <SelectField
                  value={channelFilter}
                  onChange={(e) => handleFilterChannel(e.target.value)}
                  size="sm"
                >
                  <option value="ALL">Semua Channel</option>
                  <option value="STABLE">Channel Stable</option>
                  <option value="BETA">Channel Beta</option>
                  <option value="NIGHTLY">Channel Nightly</option>
                </SelectField>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Tab 1: Table of Releases */}
        {activeTab === "releases" && (
          <ReleaseTableView
            items={releases?.items ?? []}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            onDeleteRelease={handleDeleteRelease}
          />
        )}

        {/* Tab 2: Update Logs */}
        {activeTab === "logs" && (
          <ReleaseUpdateLogsView logs={logs?.items ?? []} loading={loading} />
        )}
      </Card>

      {/* Upload Modal */}
      <ReleaseUploadModal
        open={isUploadModalOpen}
        loading={loading}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleCreateRelease}
      />
    </div>
  );
};
