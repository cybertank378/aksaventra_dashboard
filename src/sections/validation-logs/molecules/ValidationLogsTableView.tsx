"use client";

import { Eye, ShieldCheck } from "lucide-react";
import type React from "react";
import type { ValidationLogItemDTO } from "@/modules/validation-logs/domain/dto/ValidationLogResponseDTO";
import { formatTimestampWIB } from "@/modules/validation-logs/presentation/helpers/validationLogFormatters";
import Button from "@/shared-ui/component/Button";
import Skeleton from "@/shared-ui/component/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import { HttpStatusChip } from "../atomic/HttpStatusChip";
import { HwidHashPill } from "../atomic/HwidHashPill";
import { LatencyIndicator } from "../atomic/LatencyIndicator";
import { ValidationResultBadge } from "../atomic/ValidationResultBadge";

interface Props {
  logs: ValidationLogItemDTO[];
  loading: boolean;
  onInspect: (log: ValidationLogItemDTO) => void;
}

export const ValidationLogsTableView: React.FC<Props> = ({ logs, loading, onInspect }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`skel-${i}`} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h4 className="mt-3 text-sm font-bold text-slate-800">Tidak ada log validasi ditemukan</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Belum ada aktivitas otentikasi engine yang cocok dengan kriteria filter yang Anda pilih.
        </p>
      </div>
    );
  }

  return (
    <Table wrapperClassName="border-slate-200/90 shadow-2xs rounded-2xl">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Waktu (WIB)</TableHeaderCell>
          <TableHeaderCell>Klien & Key Hint</TableHeaderCell>
          <TableHeaderCell>Hasil & HTTP</TableHeaderCell>
          <TableHeaderCell>Hash HWID</TableHeaderCell>
          <TableHeaderCell>Versi Engine</TableHeaderCell>
          <TableHeaderCell>Alamat IP</TableHeaderCell>
          <TableHeaderCell>Latensi</TableHeaderCell>
          <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
            {/* 1. Timestamp */}
            <TableCell className="text-xs text-slate-500 tabular-nums font-medium whitespace-nowrap">
              {formatTimestampWIB(item.checkedAt)}
            </TableCell>

            {/* 2. Client & Key hint */}
            <TableCell>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">
                  {item.clientName ?? "Klien Tidak Terdaftar"}
                </p>
                <p className="font-mono text-[11px] text-slate-500 tracking-wider">
                  {item.serialKeyMasked}
                </p>
              </div>
            </TableCell>

            {/* 3. Result & Status */}
            <TableCell>
              <div className="flex items-center gap-1.5 flex-wrap">
                <ValidationResultBadge result={item.result} />
                <HttpStatusChip statusCode={item.statusCode} />
              </div>
            </TableCell>

            {/* 4. HWID Hash */}
            <TableCell>
              <HwidHashPill hwidHash={item.hwidHash} />
            </TableCell>

            {/* 5. Engine Version */}
            <TableCell className="text-xs font-semibold text-slate-700">
              {item.engineVersion ?? "-"}
            </TableCell>

            {/* 6. Client IP */}
            <TableCell className="text-xs font-mono text-slate-600">
              {item.clientIp ?? "-"}
            </TableCell>

            {/* 7. Latency */}
            <TableCell>
              <LatencyIndicator latencyMs={item.latencyMs} />
            </TableCell>

            {/* 8. Action */}
            <TableCell className="text-right">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onInspect(item)}
                leftIcon={Eye}
                className="h-8 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Detail
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
