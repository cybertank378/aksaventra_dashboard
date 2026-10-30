"use client";

import { Check, Copy, Download, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { ReleaseItemResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import { MandatoryBadge } from "@/sections/releases/atomic/MandatoryBadge";
import { ReleaseChannelBadge } from "@/sections/releases/atomic/ReleaseChannelBadge";
import Button from "@/shared-ui/component/Button";
import Skeleton from "@/shared-ui/component/Skeleton";
import Switch from "@/shared-ui/component/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface ReleaseTableViewProps {
  items: ReleaseItemResponseDTO[];
  loading: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteRelease: (id: string, version: string) => Promise<void>;
}

export const ReleaseTableView: React.FC<ReleaseTableViewProps> = ({
  items,
  loading,
  onToggleStatus,
  onDeleteRelease,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && items.length === 0) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <Download className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-700">Belum Ada Rilis Biner</h4>
        <p className="text-xs text-slate-400 mt-1">
          Gunakan tombol &quot;Unggah Rilis Baru&quot; untuk menambahkan versi perdana
          aksaventra_engine.exe
        </p>
      </div>
    );
  }

  return (
    <Table wrapperClassName="border-slate-200/90 shadow-sm rounded-2xl">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Versi & Channel</TableHeaderCell>
          <TableHeaderCell>Tanggal Publikasi</TableHeaderCell>
          <TableHeaderCell>Ukuran Berkas</TableHeaderCell>
          <TableHeaderCell>Checksum SHA-256</TableHeaderCell>
          <TableHeaderCell className="text-center">Diunduh</TableHeaderCell>
          <TableHeaderCell>Kategori</TableHeaderCell>
          <TableHeaderCell className="text-center">Status Aktif</TableHeaderCell>
          <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((release) => (
          <TableRow key={release.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{release.version}</span>
                <ReleaseChannelBadge channel={release.channel} />
              </div>
              {release.minSupportedVersion && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Min. Didukung: {release.minSupportedVersion}
                </div>
              )}
            </TableCell>

            <TableCell className="text-slate-600 tabular-nums">
              {formatDate(release.publishedAt)}
            </TableCell>

            <TableCell className="text-slate-600 tabular-nums font-medium">
              {formatFileSize(release.fileSize)}
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md w-fit">
                <span>
                  {release.checksumSha256.slice(0, 10)}...{release.checksumSha256.slice(-8)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(release.checksumSha256)}
                  className="hover:text-blue-600 transition-colors"
                  title="Salin SHA-256"
                >
                  {copiedHash === release.checksumSha256 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </TableCell>

            <TableCell className="text-center font-bold text-slate-700 tabular-nums">
              {release.downloadCount.toLocaleString("id-ID")}x
            </TableCell>

            <TableCell>
              <MandatoryBadge mandatory={release.mandatory} />
            </TableCell>

            <TableCell className="text-center">
              <Switch
                checked={release.isActive}
                onChange={() => onToggleStatus(release.id, release.isActive)}
                variant="success"
              />
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <a
                  href={`/api/v1/updater/download/aksaventra_engine.exe?channel=${release.channel.toLowerCase()}`}
                  download="aksaventra_engine.exe"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                  title="Unduh Biner Langsung"
                >
                  <Download className="w-4 h-4" />
                </a>

                <Button
                  variant="outline"
                  color="error"
                  size="sm"
                  onClick={() => onDeleteRelease(release.id, release.version)}
                  title="Hapus Rilis"
                  className="p-1.5 h-auto border-transparent hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
