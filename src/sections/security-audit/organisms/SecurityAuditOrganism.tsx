"use client";

import { Download } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useSecurityAuditApi } from "@/modules/auth/presentation/hooks/useSecurityAuditApi";
import Button from "@/shared-ui/component/Button";
import { showSuccessToast } from "@/shared-ui/component/Toast";
import { SecurityAuditKpiGrid } from "../molecules/SecurityAuditKpiGrid";
import { SecurityAuditTableView } from "../molecules/SecurityAuditTableView";

export const SecurityAuditOrganism: FC = () => {
  const { auditData, loading, getAuditLogs } = useSecurityAuditApi();

  const [activeTab, setActiveTab] = useState<"audit_logs" | "login_audits">("audit_logs");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAuditLogs({
      page,
      limit: 10,
      search: searchQuery || undefined,
      tab: activeTab,
    }).catch((err) => {
      console.error("[SecurityAuditOrganism] Error loading audit logs:", err);
    });
  }, [getAuditLogs, page, searchQuery, activeTab]);

  const handleTabChange = (newTab: "audit_logs" | "login_audits") => {
    setActiveTab(newTab);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleExportCsv = () => {
    if (!auditData || auditData.logs.length === 0) return;

    const headers = ["Waktu", "Aktor", "Role", "Aksi", "Target", "Detail", "IP"];
    const rows = auditData.logs.map((l) => [
      `"${l.createdAt}"`,
      `"${l.userName || ""}"`,
      `"${l.userRole || ""}"`,
      `"${l.action}"`,
      `"${l.target || ""}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.ipAddress || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `security_audit_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast("Laporan audit berhasil diekspor (.CSV)");
  };

  const summary = auditData?.summary ?? {
    totalAdminActions30d: 0,
    loginSuccess24h: 0,
    loginFailedAttempts: 0,
    criticalMutationsCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Permission: LOGS_VIEW
          </span>
        </div>

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          leftIcon={Download}
          onClick={handleExportCsv}
          disabled={!auditData || auditData.logs.length === 0}
        >
          Ekspor Laporan Audit (.CSV)
        </Button>
      </div>

      {/* KPI Cards */}
      <SecurityAuditKpiGrid summary={summary} />

      {/* Audit Trail Table */}
      <SecurityAuditTableView
        logs={auditData?.logs ?? []}
        total={auditData?.total ?? 0}
        page={auditData?.page ?? 1}
        totalPages={auditData?.totalPages ?? 1}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        isLoading={loading}
      />
    </div>
  );
};
