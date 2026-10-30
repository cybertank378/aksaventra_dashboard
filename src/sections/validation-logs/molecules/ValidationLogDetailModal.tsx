"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ValidationLogDetailResponseDTO } from "@/modules/validation-logs/domain/dto/ValidationLogResponseDTO";
import { formatTimestampWIB } from "@/modules/validation-logs/presentation/helpers/validationLogFormatters";
import { Modal } from "@/shared-ui/component/Modal";
import Skeleton from "@/shared-ui/component/Skeleton";
import { showSuccessToast } from "@/shared-ui/component/Toast";
import { HttpStatusChip } from "../atomic/HttpStatusChip";
import { LatencyIndicator } from "../atomic/LatencyIndicator";
import { ValidationResultBadge } from "../atomic/ValidationResultBadge";

interface Props {
  open: boolean;
  onClose: () => void;
  detail: ValidationLogDetailResponseDTO | null;
  loading: boolean;
}

export const ValidationLogDetailModal: React.FC<Props> = ({ open, onClose, detail, loading }) => {
  const [copiedHwid, setCopiedHwid] = useState(false);

  const log = detail?.log;
  const license = detail?.license;

  const handleCopyHwid = async () => {
    if (!log?.hwidHash) return;
    try {
      await navigator.clipboard.writeText(log.hwidHash);
      setCopiedHwid(true);
      showSuccessToast("Hash HWID SHA-256 berhasil disalin");
      setTimeout(() => setCopiedHwid(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inspeksi Telemetri Validasi Mesin"
      subtitle={log ? `Log ID: ${log.id}` : "Memuat data audit..."}
      size="lg"
      cancelText="Tutup"
      submitText=""
      className="p-6"
    >
      {loading || !log ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6 text-sm text-slate-700">
          {/* Section 1: Ringkasan Hasil Validasi */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hasil Permintaan Otentikasi
            </h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Hasil Evaluasi</p>
                <div className="mt-1">
                  <ValidationResultBadge result={log.result} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Kode HTTP</p>
                <div className="mt-1">
                  <HttpStatusChip statusCode={log.statusCode} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Waktu (WIB)</p>
                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {formatTimestampWIB(log.checkedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Latensi Pemrosesan</p>
                <div className="mt-1">
                  <LatencyIndicator latencyMs={log.latencyMs} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Identitas Mesin & Telemetri Klien */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Telemetri Biner Mesin (Hardware & Jaringan)
            </h4>

            {/* HWID Hash SHA-256 */}
            <div>
              <p className="text-xs text-slate-500">Hardware ID Hash (SHA-256)</p>
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                <span className="truncate">
                  {log.hwidHash ?? "Tidak terdeteksi / tidak dikirim"}
                </span>
                {log.hwidHash && (
                  <button
                    type="button"
                    onClick={handleCopyHwid}
                    className="ml-2 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-sans font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    {copiedHwid ? (
                      <>
                        <Check size={12} className="text-emerald-600" /> Disalin
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Salin
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-xs text-slate-500">Versi Engine Klien</p>
                <p className="mt-1 font-mono text-xs font-bold text-slate-800">
                  {log.engineVersion ?? "Tidak diketahui"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Alamat IP Permintaan</p>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800">
                  {log.clientIp ?? "Tidak tercatat"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500">User-Agent Header</p>
              <p className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-2 font-mono text-xs text-slate-600 break-all">
                {log.userAgent ?? "-"}
              </p>
            </div>
          </div>

          {/* Section 3: Lisensi Terkait */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data Lisensi Terkait di Database
              </h4>
              {license && (
                <Link
                  href={`/dashboard/licenses?search=${encodeURIComponent(license.serialKeyHint)}`}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Buka Direktori Lisensi <ExternalLink size={12} />
                </Link>
              )}
            </div>

            {license ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Nama Pelanggan</p>
                  <p className="mt-1 text-xs font-bold text-slate-900">
                    {license.clientName ?? "Tidak diset"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Serial Key Hint</p>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-800 tracking-wider">
                    ••••-••••-{license.serialKeyHint}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status Lisensi</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">{license.status}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-800">
                Permintaan ini tidak berelasi ke lisensi aktif di sistem (misal: Key Tidak Dikenal
                atau Bad Request).
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
