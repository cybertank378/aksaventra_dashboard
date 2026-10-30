"use client";

import type { LicenseValidationResult } from "@prisma/client";
import clsx from "clsx";
import { Download, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import type { ValidationLogFilterGroup } from "@/modules/validation-logs/domain/types/ValidationLogFilterGroup";
import Button from "@/shared-ui/component/Button";
import SearchField from "@/shared-ui/component/SearchField";
import SelectField from "@/shared-ui/component/SelectField";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  group: ValidationLogFilterGroup;
  onGroupChange: (group: ValidationLogFilterGroup) => void;
  resultFilter?: LicenseValidationResult;
  onResultFilterChange: (res?: LicenseValidationResult) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onOpenPruneModal?: () => void;
  loading: boolean;
}

const GROUPS: { label: string; value: ValidationLogFilterGroup; countBadge?: string }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Sukses (200)", value: "SUCCESS" },
  { label: "HWID Mismatch (403)", value: "MISMATCH" },
  { label: "Ditolak (401/404)", value: "REJECTED" },
];

export const ValidationLogFilterBar: React.FC<Props> = ({
  search,
  onSearchChange,
  group,
  onGroupChange,
  resultFilter,
  onResultFilterChange,
  onResetFilters,
  onRefresh,
  onExport,
  onOpenPruneModal,
  loading,
}) => {
  const handleSelectResult = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onResultFilterChange(val ? (val as LicenseValidationResult) : undefined);
  };

  return (
    <div className="space-y-4">
      {/* Upper toolbar: Quick tabs & Action buttons */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Quick Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/70 p-1">
          {GROUPS.map((item) => {
            const isActive = group === item.value && !resultFilter;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onGroupChange(item.value);
                  onResultFilterChange(undefined);
                }}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Segarkan, Pangkas Log & Ekspor */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {onOpenPruneModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenPruneModal}
              disabled={loading}
              leftIcon={Trash2}
              className="border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
            >
              Pangkas Log
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            loading={loading}
            leftIcon={RefreshCw}
            className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          >
            Segarkan
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            onClick={onExport}
            loading={loading}
            leftIcon={Download}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Lower toolbar: Search & specific filter selects */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder="Cari hint key, nama klien, atau alamat IP..."
            size="sm"
          />
        </div>

        <div className="w-full sm:w-56">
          <SelectField
            size="sm"
            value={resultFilter ?? ""}
            onChange={handleSelectResult}
            className="text-xs"
          >
            <option value="">Semua Hasil Validasi</option>
            <option value="VERIFIED">VERIFIED (200)</option>
            <option value="ACTIVATED">ACTIVATED (200)</option>
            <option value="HWID_MISMATCH">HWID_MISMATCH (403)</option>
            <option value="EXPIRED">EXPIRED (401)</option>
            <option value="SUSPENDED">SUSPENDED (401)</option>
            <option value="NOT_FOUND">NOT_FOUND (404)</option>
            <option value="BAD_REQUEST">BAD_REQUEST (400)</option>
          </SelectField>
        </div>

        {(search || group !== "ALL" || resultFilter) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            leftIcon={RotateCcw}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
