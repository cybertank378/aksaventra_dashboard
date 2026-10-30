"use client";

import {
  AlertOctagon,
  CheckCircle2,
  Copy,
  FileCode2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import type { BinaryIntegrityItemDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import { formatFileSize } from "@/modules/engine-validation/presentation/helpers/liveMonitorFormatters";
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
import TextAreaField from "@/shared-ui/component/TextAreaField";
import { showSuccessToast } from "@/shared-ui/component/Toast";

interface BinaryIntegrityTableViewProps {
  items: BinaryIntegrityItemDTO[];
  loading?: boolean;
  isAdmin?: boolean;
  onVerifyChecksumClick: (version: string, hash: string) => void;
  onPatchStatus: (id: string, isActive: boolean, reason?: string) => Promise<unknown>;
}

export default function BinaryIntegrityTableView({
  items,
  loading = false,
  isAdmin = true,
  onVerifyChecksumClick,
  onPatchStatus,
}: BinaryIntegrityTableViewProps) {
  const [selectedForStatus, setSelectedForStatus] = useState<BinaryIntegrityItemDTO | null>(null);
  const [patchReason, setPatchReason] = useState("");
  const [isPatching, setIsPatching] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showSuccessToast("Checksum SHA-256 disalin ke papan klip.");
  };

  const handleConfirmPatchStatus = async () => {
    if (!selectedForStatus) return;

    try {
      setIsPatching(true);
      await onPatchStatus(
        selectedForStatus.id,
        !selectedForStatus.isActive,
        patchReason || undefined,
      );
      setSelectedForStatus(null);
      setPatchReason("");
    } finally {
      setIsPatching(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Registri Integritas Biner Engine (Kepatuhan SHA-256 Isu #39)
          </h3>
          <p className="text-xs text-slate-500">
            Daftar biner resmi aksaventra_engine.exe beserta nilai hash kriptografi terverifikasi
          </p>
        </div>
        <Badge color="secondary" variant="soft">
          {items.length} Versi Terdaftar
        </Badge>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Versi & Channel</TableHeaderCell>
              <TableHeaderCell>Checksum SHA-256</TableHeaderCell>
              <TableHeaderCell>Ukuran Berkas</TableHeaderCell>
              <TableHeaderCell>Unduhan</TableHeaderCell>
              <TableHeaderCell>Status Biner</TableHeaderCell>
              <TableHeaderCell>Tanggal Rilis</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi Integritas</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2 text-xs">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                    Memuat registri biner...
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <FileCode2 size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs font-medium">
                      Belum ada registri biner engine yang terdaftar.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((release) => (
                <TableRow key={release.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Versi & Channel */}
                  <TableCell>
                    <div className="font-bold text-slate-900 text-xs">{release.version}</div>
                    <span
                      className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        release.channel === "STABLE"
                          ? "bg-emerald-50 text-emerald-700"
                          : release.channel === "BETA"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {release.channel}
                    </span>
                  </TableCell>

                  {/* SHA-256 Checksum */}
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      <span>
                        {release.checksumSha256.slice(0, 14)}…{release.checksumSha256.slice(-8)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        color="secondary"
                        size="sm"
                        iconOnly
                        leftIcon={Copy}
                        onClick={() => handleCopyHash(release.checksumSha256)}
                        title="Salin Hash SHA-256 Penuh"
                      />
                    </div>
                  </TableCell>

                  {/* Ukuran Berkas */}
                  <TableCell className="text-xs text-slate-600 font-mono">
                    {formatFileSize(release.fileSize)}
                  </TableCell>

                  {/* Unduhan */}
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {release.downloadCount.toLocaleString("id-ID")} kali
                  </TableCell>

                  {/* Status Biner */}
                  <TableCell>
                    {release.isActive ? (
                      <Badge color="success" variant="soft">
                        ● Aktif &amp; Terverifikasi
                      </Badge>
                    ) : (
                      <Badge color="error" variant="soft">
                        ✕ Dicabut (Revoked)
                      </Badge>
                    )}
                  </TableCell>

                  {/* Tanggal Rilis */}
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(release.publishedAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Aksi Integritas */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        color="secondary"
                        size="sm"
                        leftIcon={ShieldCheck}
                        onClick={() =>
                          onVerifyChecksumClick(release.version, release.checksumSha256)
                        }
                        title="Verifikasi Checksum di Simulator"
                      >
                        Uji
                      </Button>

                      {isAdmin && (
                        <Button
                          variant="outline"
                          color={release.isActive ? "error" : "secondary"}
                          size="sm"
                          leftIcon={release.isActive ? AlertOctagon : CheckCircle2}
                          onClick={() => setSelectedForStatus(release)}
                        >
                          {release.isActive ? "Cabut Biner" : "Aktifkan"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Konfirmasi PATCH Status Biner */}
      {selectedForStatus && (
        <Modal
          open={!!selectedForStatus}
          onClose={() => {
            setSelectedForStatus(null);
            setPatchReason("");
          }}
          size="md"
        >
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert
                size={20}
                className={selectedForStatus.isActive ? "text-red-600" : "text-emerald-600"}
              />
              <h3 className="text-base font-bold text-slate-900">
                {selectedForStatus.isActive
                  ? `Cabut Otorisasi Biner v${selectedForStatus.version}?`
                  : `Aktifkan Kembali Biner v${selectedForStatus.version}?`}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedForStatus.isActive
                ? "Mencabut status rilis biner ini akan menyebabkan seluruh klien yang menggunakan hash biner tersebut ditolak saat memvalidasi integritas (Isu #39). Tindakan ini akan dicatat ke dalam Audit Log."
                : "Mengaktifkan kembali rilis biner ini akan mengizinkan mesin klien memvalidasi dengan hash SHA-256 biner tersebut."}
            </p>

            <TextAreaField
              label="Alasan Perubahan Status (Opsional)"
              value={patchReason}
              onChange={(e) => setPatchReason(e.target.value)}
              placeholder="Contoh: Ditemukan kerentanan zero-day / audit keamanan rutin..."
              rows={3}
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                color="secondary"
                onClick={() => {
                  setSelectedForStatus(null);
                  setPatchReason("");
                }}
              >
                Batal
              </Button>
              <Button
                variant="filled"
                color={selectedForStatus.isActive ? "error" : "primary"}
                loading={isPatching}
                onClick={handleConfirmPatchStatus}
              >
                {selectedForStatus.isActive ? "Konfirmasi Cabut Biner" : "Konfirmasi Aktifkan"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
