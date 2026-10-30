"use client";

import { Eye, RotateCcw } from "lucide-react";
import type { LicenseAdminItemDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import HwidBindingBadge from "@/sections/license-management/atomic/HwidBindingBadge";
import LicenseStatusBadge from "@/sections/license-management/atomic/LicenseStatusBadge";
import SerialKeyBadge from "@/sections/license-management/atomic/SerialKeyBadge";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface Props {
  items: LicenseAdminItemDTO[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onRequestResetHwid?: (item: LicenseAdminItemDTO) => void;
  onInspectLicense?: (item: LicenseAdminItemDTO) => void;
}

export default function BoundDevicesTableView({
  items,
  currentPage,
  totalItems,
  itemsPerPage,
  loading = false,
  onPageChange,
  onRequestResetHwid,
  onInspectLicense,
}: Props) {
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
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Klien & Serial Key</TableHeaderCell>
              <TableHeaderCell>Fingerprint HWID</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Versi Engine</TableHeaderCell>
              <TableHeaderCell>Aktivasi Awal</TableHeaderCell>
              <TableHeaderCell>Ping Terakhir</TableHeaderCell>
              <TableHeaderCell>Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                  Memuat data perangkat terikat...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-400">
                  Tidak ada perangkat terikat yang cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900">{item.clientName}</span>
                      <SerialKeyBadge serialKey={item.serialKey} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <HwidBindingBadge hwid={item.hwid} />
                  </TableCell>
                  <TableCell>
                    <LicenseStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-700">
                      {item.engineVersion ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{formatDate(item.activatedAt)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">
                      {formatDate(item.lastVerifiedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {onInspectLicense && (
                        <Button
                          size="sm"
                          variant="ghost"
                          color="secondary"
                          leftIcon={Eye}
                          onClick={() => onInspectLicense(item)}
                          title="Inspeksi detail dan log"
                        >
                          Detail
                        </Button>
                      )}
                      {onRequestResetHwid && item.isBound && (
                        <Button
                          size="sm"
                          variant="outline"
                          color="warning"
                          leftIcon={RotateCcw}
                          onClick={() => onRequestResetHwid(item)}
                        >
                          Lepas HWID
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

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChangeAction={onPageChange}
        />
      )}
    </div>
  );
}
