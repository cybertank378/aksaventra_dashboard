import { ChevronLeft, ChevronRight, FileText, Search, UserCheck } from "lucide-react";
import type { ChangeEvent, FC } from "react";
import type { SecurityAuditItemDTO } from "@/modules/auth/domain/dto/SecurityAuditDTO";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import { AuditActionBadge } from "../atomic/AuditActionBadge";

interface SecurityAuditTableViewProps {
  logs: SecurityAuditItemDTO[];
  total: number;
  page: number;
  totalPages: number;
  activeTab: "audit_logs" | "login_audits";
  onTabChange: (tab: "audit_logs" | "login_audits") => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export const SecurityAuditTableView: FC<SecurityAuditTableViewProps> = ({
  logs,
  total,
  page,
  totalPages,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onPageChange,
  isLoading = false,
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handlePrevPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <Card className="border border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
      {/* Header Bar with Tabs and Search */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => onTabChange("audit_logs")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "audit_logs"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={14} />
            Log Audit Admin (audit_logs)
          </button>

          <button
            type="button"
            onClick={() => onTabChange("login_audits")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "login_audits"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck size={14} />
            Jejak Autentikasi & Anomali (login_audits)
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Cari aktor, aksi, atau target ID..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-slate-200">
          <TableHead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <TableRow>
              <TableHeaderCell className="py-3 px-4 text-left">Waktu (WIB)</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left">Aktor Personel</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left">Kategori Aksi</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left">Target Entitas</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left">
                Ringkasan Perubahan (Payload Diff)
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                  Memuat data riwayat audit...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                  Tidak ada rekam jejak audit yang sesuai dengan filter
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const formattedDate = new Date(log.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {formattedDate}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{log.userName}</p>
                      <p className="text-[10px] text-blue-600 font-semibold">{log.userRole}</p>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 whitespace-nowrap">
                      <AuditActionBadge action={log.action} />
                    </TableCell>

                    <TableCell className="py-3.5 px-4 font-mono text-slate-700 text-[11px]">
                      {log.target || "-"}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 max-w-md">
                      <div className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 p-1.5 rounded-lg truncate">
                        {log.details || "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <p>
          Menampilkan <span className="font-bold text-slate-800">{logs.length}</span> dari{" "}
          <span className="font-bold text-slate-800">{total}</span> jejak audit administratif
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={page <= 1 || isLoading}
            leftIcon={ChevronLeft}
          >
            Sebelumnya
          </Button>

          <span className="font-semibold text-slate-700 px-2">
            Halaman {page} dari {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages || isLoading}
            rightIcon={ChevronRight}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </Card>
  );
};
