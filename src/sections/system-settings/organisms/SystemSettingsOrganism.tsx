"use client";

import { Check, RefreshCw, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  LicenseEngineSettingsDTO,
  RetentionAuditSettingsDTO,
  SecurityAuthSettingsDTO,
} from "@/modules/settings/domain/dto/SystemSettingsResponseDTO";
import { useSystemSettingsApi } from "@/modules/settings/presentation/hooks/useSystemSettingsApi";
import type { SettingCategoryType } from "@/modules/settings/shared/constants/defaultSystemSettings";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import ToggleGroup from "@/shared-ui/component/ToggleGroup";
import { UnsavedChangesBanner } from "../atomic/UnsavedChangesBanner";
import { ConfirmPurgeLogsModal } from "../molecules/ConfirmPurgeLogsModal";
import { InfrastructureDiagnosticsView } from "../molecules/InfrastructureDiagnosticsView";
import { LicenseEngineSettingsForm } from "../molecules/LicenseEngineSettingsForm";
import { RetentionAuditSettingsForm } from "../molecules/RetentionAuditSettingsForm";
import { SecurityAuthSettingsForm } from "../molecules/SecurityAuthSettingsForm";
import { SystemStatusSummaryGrid } from "../molecules/SystemStatusSummaryGrid";

type TabType = SettingCategoryType | "INFRASTRUCTURE";

export function SystemSettingsOrganism() {
  const {
    settings,
    loading,
    isUpdating,
    isResetting,
    isPurging,
    fetchSettings,
    updateSettings,
    resetCategory,
    purgeExpiredLogs,
  } = useSystemSettingsApi();

  const [activeTab, setActiveTab] = useState<TabType>("LICENSE_ENGINE");
  const [draftLicenseEngine, setDraftLicenseEngine] = useState<LicenseEngineSettingsDTO | null>(
    null,
  );
  const [draftSecurityAuth, setDraftSecurityAuth] = useState<SecurityAuthSettingsDTO | null>(null);
  const [draftRetentionAudit, setDraftRetentionAudit] = useState<RetentionAuditSettingsDTO | null>(
    null,
  );
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Sync draft states when settings load or update
  useEffect(() => {
    if (settings) {
      setDraftLicenseEngine({ ...settings.licenseEngine });
      setDraftSecurityAuth({ ...settings.securityAuth });
      setDraftRetentionAudit({ ...settings.retentionAudit });
    }
  }, [settings]);

  // Compute dirty flag for current active tab
  const isDirty = useMemo(() => {
    if (!settings) return false;

    if (activeTab === "LICENSE_ENGINE" && draftLicenseEngine) {
      return JSON.stringify(settings.licenseEngine) !== JSON.stringify(draftLicenseEngine);
    }
    if (activeTab === "SECURITY_AUTH" && draftSecurityAuth) {
      return JSON.stringify(settings.securityAuth) !== JSON.stringify(draftSecurityAuth);
    }
    if (activeTab === "RETENTION_AUDIT" && draftRetentionAudit) {
      return JSON.stringify(settings.retentionAudit) !== JSON.stringify(draftRetentionAudit);
    }
    return false;
  }, [settings, activeTab, draftLicenseEngine, draftSecurityAuth, draftRetentionAudit]);

  /* ==========================================================
   * NAMED EVENT HANDLERS
   * ======================================================== */
  const handleTabChange = (val: string) => {
    setActiveTab(val as TabType);
  };

  const handleLicenseEngineChange = <K extends keyof LicenseEngineSettingsDTO>(
    key: K,
    value: LicenseEngineSettingsDTO[K],
  ) => {
    setDraftLicenseEngine((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSecurityAuthChange = <K extends keyof SecurityAuthSettingsDTO>(
    key: K,
    value: SecurityAuthSettingsDTO[K],
  ) => {
    setDraftSecurityAuth((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleRetentionAuditChange = <K extends keyof RetentionAuditSettingsDTO>(
    key: K,
    value: RetentionAuditSettingsDTO[K],
  ) => {
    setDraftRetentionAudit((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleDiscardChanges = () => {
    if (!settings) return;
    if (activeTab === "LICENSE_ENGINE") {
      setDraftLicenseEngine({ ...settings.licenseEngine });
    } else if (activeTab === "SECURITY_AUTH") {
      setDraftSecurityAuth({ ...settings.securityAuth });
    } else if (activeTab === "RETENTION_AUDIT") {
      setDraftRetentionAudit({ ...settings.retentionAudit });
    }
  };

  const handleSaveSettings = async () => {
    if (!isDirty) return;

    if (activeTab === "LICENSE_ENGINE" && draftLicenseEngine) {
      await updateSettings({
        category: "LICENSE_ENGINE",
        licenseEngine: draftLicenseEngine,
      });
    } else if (activeTab === "SECURITY_AUTH" && draftSecurityAuth) {
      await updateSettings({
        category: "SECURITY_AUTH",
        securityAuth: draftSecurityAuth,
      });
    } else if (activeTab === "RETENTION_AUDIT" && draftRetentionAudit) {
      await updateSettings({
        category: "RETENTION_AUDIT",
        retentionAudit: draftRetentionAudit,
      });
    }
  };

  const handleResetCategory = async () => {
    if (activeTab === "INFRASTRUCTURE") return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengembalikan pengaturan tab "${activeTab}" ke nilai default pabrik?`,
    );
    if (!confirmed) return;

    await resetCategory({
      category: activeTab,
    });
  };

  const handleOpenPurgeModal = () => {
    setIsPurgeModalOpen(true);
  };

  const handleClosePurgeModal = () => {
    setIsPurgeModalOpen(false);
  };

  const handleConfirmPurgeLogs = async (target: "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS") => {
    const result = await purgeExpiredLogs({ target, confirm: true });
    if (result) {
      setIsPurgeModalOpen(false);
    }
  };

  const formattedLastUpdated = useMemo(() => {
    if (!settings?.lastUpdatedAt) return null;
    try {
      const d = new Date(settings.lastUpdatedAt);
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return settings.lastUpdatedAt;
    }
  }, [settings?.lastUpdatedAt]);

  const tabOptions = [
    { label: "Lisensi & Engine", value: "LICENSE_ENGINE" },
    { label: "Keamanan & Sesi", value: "SECURITY_AUTH" },
    { label: "Retensi & Audit", value: "RETENTION_AUDIT" },
    { label: "Diagnostik Sistem", value: "INFRASTRUCTURE" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Pengaturan Sistem & Kebijakan Keamanan
              </h1>
              <p className="text-xs text-slate-500">
                Konfigurasi parameter operasional lisensi, validasi engine, autentikasi, dan retensi
                log
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={fetchSettings}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>

          {activeTab !== "INFRASTRUCTURE" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleResetCategory}
                disabled={isResetting || loading}
                loading={isResetting}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset Kategori
              </Button>

              <Button
                type="button"
                variant="filled"
                color="primary"
                size="md"
                onClick={handleSaveSettings}
                disabled={!isDirty || isUpdating || loading}
                loading={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Simpan Perubahan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 4 STATUS CARDS */}
      <SystemStatusSummaryGrid settings={settings} />

      {/* TAB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <ToggleGroup options={tabOptions} value={activeTab} onChange={handleTabChange} />
      </div>

      {/* FORMULIR / PANEL KONTEN UTAMA */}
      <Card className="p-6 border-slate-200/90 shadow-xs bg-white rounded-2xl">
        {activeTab === "LICENSE_ENGINE" && draftLicenseEngine && (
          <LicenseEngineSettingsForm
            values={draftLicenseEngine}
            onChange={handleLicenseEngineChange}
            disabled={isUpdating || isResetting}
          />
        )}

        {activeTab === "SECURITY_AUTH" && draftSecurityAuth && (
          <SecurityAuthSettingsForm
            values={draftSecurityAuth}
            onChange={handleSecurityAuthChange}
            disabled={isUpdating || isResetting}
          />
        )}

        {activeTab === "RETENTION_AUDIT" && draftRetentionAudit && (
          <RetentionAuditSettingsForm
            values={draftRetentionAudit}
            onChange={handleRetentionAuditChange}
            onOpenPurgeModal={handleOpenPurgeModal}
            disabled={isUpdating || isResetting}
          />
        )}

        {activeTab === "INFRASTRUCTURE" && (
          <InfrastructureDiagnosticsView diagnostics={settings?.diagnostics ?? null} />
        )}

        {/* METADATA FOOTER */}
        {formattedLastUpdated && (
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span>
              Terakhir diperbarui: {formattedLastUpdated}
              {settings?.lastUpdatedByName ? ` oleh ${settings.lastUpdatedByName}` : ""}
            </span>
            <span>Aksaventra Engine Configuration Kernel v2.2</span>
          </div>
        )}
      </Card>

      {/* UNSAVED CHANGES FLOATING BANNER */}
      <UnsavedChangesBanner
        isDirty={isDirty}
        onSave={handleSaveSettings}
        onDiscard={handleDiscardChanges}
        isSaving={isUpdating}
      />

      {/* MODAL KONFIRMASI PURGE LOGS */}
      {settings && (
        <ConfirmPurgeLogsModal
          open={isPurgeModalOpen}
          onClose={handleClosePurgeModal}
          onConfirm={handleConfirmPurgeLogs}
          isPurging={isPurging}
          validationRetentionDays={settings.retentionAudit.validationLogRetentionDays}
          updateRetentionDays={settings.retentionAudit.updateLogRetentionDays}
        />
      )}
    </div>
  );
}
