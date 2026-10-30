"use client";

import { Eye, RotateCcw, ShieldBan } from "lucide-react";
import type { LicenseAdminItemDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import HwidBindingBadge from "@/sections/license-management/atomic/HwidBindingBadge";
import LicenseStatusBadge from "@/sections/license-management/atomic/LicenseStatusBadge";
import SerialKeyBadge from "@/sections/license-management/atomic/SerialKeyBadge";
import Badge from "@/shared-ui/component/Badge";
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

export type LicenseTier = "TRIAL" | "PRO" | "ENTERPRISE";

interface Props {
  items: LicenseAdminItemDTO[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onRequestResetHwid?: (item: LicenseAdminItemDTO) => void;
  onRequestRevoke?: (item: LicenseAdminItemDTO) => void;
  onInspectLicense?: (item: LicenseAdminItemDTO) => void;
}

export default function LicenseTableView({
  items,
  currentPage,
  totalItems,
  itemsPerPage,
  loading = false,
  onPageChange,
  onRequestResetHwid,
  onRequestRevoke,
  onInspectLicense,
}: Props) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
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
              <TableHeaderCell>Serial Key</TableHeaderCell>
              <TableHeaderCell>Instansi / Klien</TableHeaderCell>
              <TableHeaderCell>Ikatan HWID</TableHeaderCell>
              <TableHeaderCell>Versi Engine</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Kedaluwarsa</TableHeaderCell>
              <TableHeaderCell>Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                  Memuat data lisensi dari database...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-400">
                  Tidak ada lisensi yang cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <SerialKeyBadge serialKey={item.serialKey} />
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{item.clientName}</div>
                    <div className="text-xs text-slate-500">
                      Verifikasi: {formatDate(item.lastVerifiedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <HwidBindingBadge hwid={item.hwid} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-700">
                      {item.engineVersion ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <LicenseStatusBadge status={item.status} />
                      {item.isExpiringSoon && (
                        <Badge color="warning" variant="soft" className="w-fit text-[10px]">
                          Segera Habis (&lt;30H)
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700">
                      {item.expiresAt ? formatDate(item.expiresAt) : "Seumur Hidup"}
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
                          title="Inspeksi detail dan log validasi"
                        >
                          Detail
                        </Button>
                      )}
                      {onRequestResetHwid && item.isBound && (
                        <Button
                          size="sm"
                          variant="outline"
                          color="secondary"
                          leftIcon={RotateCcw}
                          onClick={() => onRequestResetHwid(item)}
                        >
                          Reset HWID
                        </Button>
                      )}
                      {onRequestRevoke && item.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="outline"
                          color="error"
                          leftIcon={ShieldBan}
                          onClick={() => onRequestRevoke(item)}
                        >
                          Bekukan
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
