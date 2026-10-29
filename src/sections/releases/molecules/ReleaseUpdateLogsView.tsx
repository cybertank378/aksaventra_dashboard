"use client";

import { Activity, ArrowDownToLine, RefreshCw } from "lucide-react";
import type React from "react";
import type { UpdateLogItemResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import Badge from "@/shared-ui/component/Badge";
import Skeleton from "@/shared-ui/component/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface ReleaseUpdateLogsViewProps {
  logs: UpdateLogItemResponseDTO[];
  loading: boolean;
}

export const ReleaseUpdateLogsView: React.FC<ReleaseUpdateLogsViewProps> = ({ logs, loading }) => {
  const formatDate = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-700">Belum Ada Aktivitas Update</h4>
        <p className="text-xs text-slate-400 mt-1">
          Log akan otomatis tercatat saat mesin aksaventra_engine.exe melakukan pengecekan versi
          atau pengunduhan.
        </p>
      </div>
    );
  }

  return (
    <Table wrapperClassName="border-slate-200/90 shadow-sm rounded-2xl">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Waktu</TableHeaderCell>
          <TableHeaderCell>Aksi</TableHeaderCell>
          <TableHeaderCell>Versi Klien</TableHeaderCell>
          <TableHeaderCell>Channel</TableHeaderCell>
          <TableHeaderCell>Hardware ID (HWID)</TableHeaderCell>
          <TableHeaderCell>Serial Key</TableHeaderCell>
          <TableHeaderCell>IP Address</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="text-xs text-slate-500 tabular-nums">
              {formatDate(log.createdAt)}
            </TableCell>

            <TableCell>
              {log.action === "DOWNLOAD" ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <ArrowDownToLine className="w-3 h-3" />
                  UNDUH
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <RefreshCw className="w-3 h-3" />
                  CEK VERSI
                </span>
              )}
            </TableCell>

            <TableCell className="font-semibold text-slate-800 text-xs">
              {log.clientVersion}
            </TableCell>

            <TableCell>
              <Badge color="secondary" variant="soft" className="uppercase text-[10px]">
                {log.channel}
              </Badge>
            </TableCell>

            <TableCell className="font-mono text-xs text-slate-500">
              {log.hwid ? `${log.hwid.slice(0, 8)}...${log.hwid.slice(-6)}` : "—"}
            </TableCell>

            <TableCell className="font-mono text-xs text-slate-500">
              {log.serialKey ? `${log.serialKey.slice(0, 8)}...` : "—"}
            </TableCell>

            <TableCell className="text-xs text-slate-500 tabular-nums">
              {log.clientIp ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
