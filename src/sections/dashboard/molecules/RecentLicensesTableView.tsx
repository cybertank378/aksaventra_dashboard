"use client";

import { Key } from "lucide-react";
import Link from "next/link";
import type React from "react";
import type { RecentLicenseItemDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { formatDisplayDate } from "@/modules/dashboards/presentation/helpers/chartFormatters";
import { DeviceBindingIndicator } from "@/sections/dashboard/atomic/DeviceBindingIndicator";
import { LicenseExpiryBadge } from "@/sections/dashboard/atomic/LicenseExpiryBadge";
import { MaskedSerialKey } from "@/sections/dashboard/atomic/MaskedSerialKey";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import Skeleton from "@/shared-ui/component/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

export interface RecentLicensesTableViewProps {
  items?: RecentLicenseItemDTO[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  canManage?: boolean;
  onPageChange: (page: number) => void;
}

export function RecentLicensesTableView({
  items,
  total,
  page,
  limit,
  loading = false,
  canManage = true,
  onPageChange,
}: RecentLicensesTableViewProps): React.JSX.Element {
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={`tbl-skel-${i}`} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const list = items ?? [];

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Key className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Tidak ada lisensi pada tab ini</p>
        <p className="mt-1 text-xs text-slate-500">
          Gunakan filter lain atau terbitkan lisensi baru dari panel navigasi.
        </p>
        {canManage && (
          <div className="mt-4">
            <Link href="/dashboard/licenses">
              <Button size="sm" variant="filled" color="primary">
                + Buat Lisensi Baru
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table wrapperClassName="rounded-xl border border-slate-200/90 shadow-2xs">
        <TableHead className="bg-slate-50/80 border-b border-slate-200/90 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <TableRow>
            <TableHeaderCell className="py-3.5 px-4 text-left">Nama Klien</TableHeaderCell>
            <TableHeaderCell className="py-3.5 px-4 text-left">Kunci Serial</TableHeaderCell>
            <TableHeaderCell className="py-3.5 px-4 text-left">Versi Engine</TableHeaderCell>
            <TableHeaderCell className="py-3.5 px-4 text-left">Status HWID</TableHeaderCell>
            <TableHeaderCell className="py-3.5 px-4 text-left">Kedaluwarsa</TableHeaderCell>
            <TableHeaderCell className="py-3.5 px-4 text-left">Status</TableHeaderCell>
            {canManage && (
              <TableHeaderCell className="py-3.5 px-4 text-right">Aksi</TableHeaderCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-slate-100 text-xs">
          {list.map((item) => (
            <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
              <TableCell className="py-3.5 px-4 font-semibold text-slate-900">
                {item.clientName}
              </TableCell>
              <TableCell className="py-3.5 px-4">
                <MaskedSerialKey serialKeyMasked={item.serialKeyMasked} />
              </TableCell>
              <TableCell className="py-3.5 px-4 font-medium text-slate-600">
                {item.engineVersion}
              </TableCell>
              <TableCell className="py-3.5 px-4">
                <DeviceBindingIndicator status={item.hwidStatus} />
              </TableCell>
              <TableCell className="py-3.5 px-4 text-slate-600">
                {item.expiresAt ? formatDisplayDate(item.expiresAt) : "Seumur Hidup"}
              </TableCell>
              <TableCell className="py-3.5 px-4">
                <LicenseExpiryBadge status={item.status} />
              </TableCell>
              {canManage && (
                <TableCell className="py-3.5 px-4 text-right">
                  <Link href={`/dashboard/licenses`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Kelola
                    </Button>
                  </Link>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500">
          Menampilkan <span className="font-semibold text-slate-800">{list.length}</span> dari{" "}
          <span className="font-semibold text-slate-800">{total}</span> total lisensi
        </p>
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChangeAction={handlePageChange}
        />
      </div>
    </div>
  );
}

export default RecentLicensesTableView;
