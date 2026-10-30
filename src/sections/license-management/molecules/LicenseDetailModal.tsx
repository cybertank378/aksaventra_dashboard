"use client";

import { Check, Copy, KeyRound, Lock, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { LicenseDetailResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import LicenseStatusBadge from "@/sections/license-management/atomic/LicenseStatusBadge";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import { Modal } from "@/shared-ui/component/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface Props {
  open: boolean;
  license: LicenseDetailResponseDTO | null;
  loading?: boolean;
  onClose: () => void;
  onRequestResetHwid?: (licenseId: string) => void;
}

export default function LicenseDetailModal({
  open,
  license,
  loading = false,
  onClose,
  onRequestResetHwid,
}: Props) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  const handleCopySerialKey = () => {
    if (!license) return;
    navigator.clipboard.writeText(license.serialKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyHwid = () => {
    if (!license?.hwid) return;
    navigator.clipboard.writeText(license.hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleTriggerResetHwid = () => {
    if (license && onRequestResetHwid) {
      onRequestResetHwid(license.id);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      open={open}
      title="Detail Lisensi & Jejak Validasi Mesin"
      subtitle="Inspeksi metadata lisensi, status penguncian perangkat (HWID), dan 10 riwayat validasi mesin terakhir"
      onClose={onClose}
      size="xl"
      cancelText="Tutup"
    >
      {loading && !license ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-sm text-slate-500">Memuat detail lisensi...</div>
        </div>
      ) : license ? (
        <div className="space-y-6">
          {/* TOP METADATA CARDS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* KARTU 1: METADATA KLIEN & LISENSI */}
            <Card className="space-y-3 border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">IDENTITAS KLIEN</span>
                <LicenseStatusBadge status={license.status} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{license.clientName}</h3>
                {license.npsn && (
                  <p className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit my-1 border border-emerald-200">
                    NPSN: {license.npsn}
                  </p>
                )}
                <p className="font-mono text-xs text-slate-500">ID: {license.id}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-slate-500" />
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {license.serialKey}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySerialKey}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    {copiedKey ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copiedKey ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Dibuat:</span>
                  <p className="font-medium text-slate-700">{formatDate(license.createdAt)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Kedaluwarsa:</span>
                  <p className="font-medium text-slate-700">
                    {license.expiresAt ? formatDate(license.expiresAt) : "Seumur Hidup"}
                  </p>
                </div>
              </div>
            </Card>

            {/* KARTU 2: HARDWARE LOCK BOX */}
            <Card className="space-y-3 border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  STATUS PENGUNCIAN MESIN
                </span>
                {license.isBound ? (
                  <Badge color="success" variant="soft">
                    <Lock size={12} className="mr-1 inline text-emerald-600" />
                    Terikat HWID
                  </Badge>
                ) : (
                  <Badge color="secondary" variant="soft">
                    Belum Terikat
                  </Badge>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">HARDWARE ID (HWID)</span>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {license.hwid ?? "Menunggu aktivasi pertama dari mesin klien"}
                    </p>
                  </div>
                  {license.hwid && (
                    <button
                      type="button"
                      onClick={handleCopyHwid}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      {copiedHwid ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Versi Engine:</span>
                  <p className="font-mono font-medium text-slate-700">
                    {license.engineVersion ?? "-"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Aktivasi Awal:</span>
                  <p className="font-medium text-slate-700">{formatDate(license.activatedAt)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Ping Terakhir:</span>
                  <p className="font-medium text-slate-700">{formatDate(license.lastVerifiedAt)}</p>
                </div>
              </div>

              {license.isBound && onRequestResetHwid && (
                <div className="pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    color="warning"
                    leftIcon={RotateCcw}
                    onClick={handleTriggerResetHwid}
                  >
                    Lepas Ikatan HWID (Reset Binding)
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* RECENT VALIDATION LOGS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                10 Riwayat Validasi Mesin Terakhir
              </h4>
              <span className="text-xs text-slate-500">Tabel license_validation_logs</span>
            </div>

            {license.recentValidationLogs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Belum ada jejak validasi dari aksaventra_engine.exe untuk lisensi ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Waktu Periksa</TableHeaderCell>
                      <TableHeaderCell>Hasil Validasi</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>IP Klien</TableHeaderCell>
                      <TableHeaderCell>Versi Engine</TableHeaderCell>
                      <TableHeaderCell>Latensi</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {license.recentValidationLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <span className="text-xs text-slate-600">
                            {formatDate(log.checkedAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            color={
                              log.result === "VERIFIED" || log.result === "ACTIVATED"
                                ? "success"
                                : log.result === "HWID_MISMATCH"
                                  ? "error"
                                  : "warning"
                            }
                            variant="soft"
                            className="font-mono text-[11px]"
                          >
                            {log.result}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            {log.statusCode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-600">
                            {log.clientIp ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-600">
                            {log.engineVersion ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
