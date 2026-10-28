"use client";

import { RotateCcw, ShieldBan } from "lucide-react";
import type { LicenseDisplayStatus } from "@/sections/license-management/atomic/LicenseStatusBadge";
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

export interface LicenseItemViewModel {
  id: string;
  serialKey: string;
  clientName: string;
  tier: LicenseTier;
  hwid: string | null;
  engineVersion: string;
  status: LicenseDisplayStatus;
  expiresAt: string;
  lastVerifiedAt: string;
}

interface Props {
  items: LicenseItemViewModel[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRequestResetHwid?: (item: LicenseItemViewModel) => void;
  onRequestRevoke?: (item: LicenseItemViewModel) => void;
}

export default function LicenseTableView({
  items,
  currentPage,
  itemsPerPage,
  onPageChange,
  onRequestResetHwid,
  onRequestRevoke,
}: Props) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Serial Key & HWID</TableHeaderCell>
            <TableHeaderCell>Instansi / Klien</TableHeaderCell>
            <TableHeaderCell>Tier</TableHeaderCell>
            <TableHeaderCell>Versi Engine</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Kedaluwarsa</TableHeaderCell>
            <TableHeaderCell>Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <SerialKeyBadge serialKey={item.serialKey} hwid={item.hwid} />
              </TableCell>
              <TableCell>
                <div className="font-medium text-slate-900">{item.clientName}</div>
                <div className="text-xs text-slate-500">Verifikasi: {item.lastVerifiedAt}</div>
              </TableCell>
              <TableCell>
                <Badge
                  color={
                    item.tier === "ENTERPRISE"
                      ? "primary"
                      : item.tier === "PRO"
                        ? "info"
                        : "secondary"
                  }
                  variant="soft"
                >
                  {item.tier}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-slate-700">{item.engineVersion}</span>
              </TableCell>
              <TableCell>
                <LicenseStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <span className="text-xs text-slate-600">{item.expiresAt}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onRequestResetHwid && (
                    <Button
                      size="sm"
                      variant="outline"
                      color="secondary"
                      leftIcon={RotateCcw}
                      disabled={!item.hwid}
                      onClick={() => onRequestResetHwid(item)}
                    >
                      Reset HWID
                    </Button>
                  )}
                  {onRequestRevoke && item.status !== "REVOKED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      color="error"
                      leftIcon={ShieldBan}
                      onClick={() => onRequestRevoke(item)}
                    >
                      Cabut
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalItems={items.length}
        itemsPerPage={itemsPerPage}
        onPageChangeAction={onPageChange}
      />
    </div>
  );
}

