"use client";

import { Copy, Eye, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { LiveFeedItemDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import {
  formatLatency,
  formatRelativeTime,
  getValidationResultBadgeProps,
} from "@/modules/engine-validation/presentation/helpers/liveMonitorFormatters";
import type { LiveFeedGroup } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import { Modal } from "@/shared-ui/component/Modal";
import Pagination from "@/shared-ui/component/Pagination";
import SearchField from "@/shared-ui/component/SearchField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import { showSuccessToast } from "@/shared-ui/component/Toast";

interface LiveValidationFeedTableViewProps {
  items: LiveFeedItemDTO[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  activeGroup: LiveFeedGroup;
  search: string;
  loading?: boolean;
  onGroupChange: (group: LiveFeedGroup) => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
}

export default function LiveValidationFeedTableView({
  items,
  totalItems,
  page,
  limit,
  totalPages,
  activeGroup,
  search,
  loading = false,
  onGroupChange,
  onSearchChange,
  onPageChange,
}: LiveValidationFeedTableViewProps) {
  const [selectedLog, setSelectedLog] = useState<LiveFeedItemDTO | null>(null);

  const groupTabs: Array<{ id: LiveFeedGroup; label: string }> = [
    { id: "ALL", label: "Semua Stream" },
    { id: "VERIFIED", label: "200 Terverifikasi" },
    { id: "ACTIVATED", label: "200 Aktivasi Baru" },
    { id: "MISMATCH", label: "403 HWID Mismatch" },
    { id: "REJECTED", label: "4xx Ditolak" },
  ];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSuccessToast(`${label} disalin ke papan klip.`);
  };

  return (
    <Card className="p-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Live Validation Telemetry Feed</h3>
          <p className="text-xs text-slate-500">
            Aliran live aktivitas otentikasi engine klien secara berkesinambungan
          </p>
        </div>

        {/* Group Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 p-1.5">
          {groupTabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={activeGroup === tab.id ? "filled" : "ghost"}
              color={activeGroup === tab.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => onGroupChange(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-80">
          <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder="Cari nama klien, key hint, IP, versi..."
          />
        </div>

        <p className="text-xs text-slate-500">
          Menampilkan <span className="font-semibold text-slate-800">{items.length}</span> dari{" "}
          <span className="font-semibold text-slate-800">{totalItems}</span> catatan live
        </p>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Waktu (Live)</TableHeaderCell>
              <TableHeaderCell>Klien & Key Hint</TableHeaderCell>
              <TableHeaderCell>Status Validasi</TableHeaderCell>
              <TableHeaderCell>Hardware Hash (HWID)</TableHeaderCell>
              <TableHeaderCell>Versi Engine</TableHeaderCell>
              <TableHeaderCell>Client IP & Latensi</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2 text-xs">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                    Menyinkronkan feed telemetri live...
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <FileText size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs font-medium">
                      Tidak ada log telemetri yang cocok dengan kriteria filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((log) => {
                const { relative, time } = formatRelativeTime(log.checkedAt);
                const badgeProps = getValidationResultBadgeProps(log.result, log.statusCode);
                const latency = formatLatency(log.latencyMs);

                return (
                  <TableRow key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Waktu Live */}
                    <TableCell className="whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-900">{relative}</div>
                      <div className="text-[11px] text-slate-400 font-mono">({time})</div>
                    </TableCell>

                    {/* Klien & Key Hint */}
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-900 max-w-[180px] truncate">
                        {log.clientName || "Tidak Diketahui"}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 font-medium">
                        {log.serialKeyMasked}
                      </div>
                    </TableCell>

                    {/* Status Validasi */}
                    <TableCell>
                      <Badge color={badgeProps.color} variant="soft">
                        {badgeProps.label}
                      </Badge>
                    </TableCell>

                    {/* Hash HWID */}
                    <TableCell>
                      {log.hwidHash ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          <span>
                            {log.hwidHash.slice(0, 10)}…{log.hwidHash.slice(-6)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            color="secondary"
                            size="sm"
                            iconOnly
                            leftIcon={Copy}
                            onClick={() => handleCopyText(log.hwidHash || "", "HWID Hash")}
                            title="Salin Hash HWID Penuh"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </TableCell>

                    {/* Versi Engine */}
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700">
                        {log.engineVersion || "v-"}
                      </span>
                    </TableCell>

                    {/* IP & Latensi */}
                    <TableCell>
                      <div className="font-mono text-[11px] text-slate-600">
                        {log.clientIp || "0.0.0.0"}
                      </div>
                      <div className="text-xs font-semibold">
                        <span
                          className={
                            latency.tone === "success"
                              ? "text-emerald-700"
                              : latency.tone === "warning"
                                ? "text-amber-700"
                                : "text-red-700"
                          }
                        >
                          {latency.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* Aksi Inspeksi */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        color="secondary"
                        size="sm"
                        leftIcon={Eye}
                        onClick={() => setSelectedLog(log)}
                        title="Inspeksi Telemetri Penuh"
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Halaman <span className="font-semibold text-slate-700">{page}</span> dari{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChangeAction={onPageChange}
          />
        </div>
      )}

      {/* Modal Detail Log Inspeksi */}
      {selectedLog && (
        <Modal open={!!selectedLog} onClose={() => setSelectedLog(null)} size="md">
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck size={20} className="text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Inspeksi Telemetri Log Validasi
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Log ID</p>
                <p className="font-mono font-semibold text-slate-800 break-all">{selectedLog.id}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Waktu Validasi</p>
                <p className="font-semibold text-slate-800">
                  {new Date(selectedLog.checkedAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Klien</p>
                <p className="font-semibold text-slate-800">{selectedLog.clientName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Serial Key Masked</p>
                <p className="font-mono font-semibold text-slate-800">
                  {selectedLog.serialKeyMasked}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Hasil Validasi</p>
                <p className="font-semibold text-slate-800">
                  {selectedLog.result} ({selectedLog.statusCode})
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Latensi Pemrosesan</p>
                <p className="font-semibold text-slate-800">{selectedLog.latencyMs ?? 0} ms</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">Hash HWID Penuh (SHA-256):</p>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] text-slate-700 break-all select-all">
                {selectedLog.hwidHash ?? "Tidak tercatat"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">Client IP Address:</p>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                {selectedLog.clientIp ?? "Tidak tercatat"}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" color="secondary" onClick={() => setSelectedLog(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
