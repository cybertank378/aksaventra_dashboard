"use client";

import { AlertCircle, Clock, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import type { UserDetailResponseDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import { UserStatusBadge } from "@/sections/user-management/atomic/UserStatusBadge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import { Modal } from "@/shared-ui/component/Modal";
import RoleBadge from "@/shared-ui/component/RoleBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userDetail: UserDetailResponseDTO | null;
  onRevokeSessions: (userId: string) => Promise<void>;
  revoking?: boolean;
}

export const UserDetailModal = ({
  open,
  onClose,
  userDetail,
  onRevokeSessions,
  revoking,
}: UserDetailModalProps) => {
  if (!userDetail) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Profil & Keamanan Sesi"
      subtitle={`Informasi lengkap untuk pengguna ${userDetail.email}`}
      size="xl"
      cancelText="Tutup"
    >
      <div className="space-y-6 py-2">
        {/* User Profile Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase">Informasi Akun</span>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm font-bold text-slate-900">{userDetail.name}</p>
                <p className="text-xs text-slate-500 font-mono">{userDetail.email}</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <RoleBadge role={userDetail.role} size="sm" />
                <UserStatusBadge state={userDetail.accountState} />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase">Aktivitas Login</span>
            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Terakhir Login:</span>
                <span className="font-medium">
                  {userDetail.lastLoginAt
                    ? new Date(userDetail.lastLoginAt).toLocaleString("id-ID")
                    : "Belum pernah"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Percobaan Gagal:</span>
                <span className="font-semibold text-rose-600">
                  {userDetail.failedLoginAttempts} kali
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Kunci:</span>
                <span>{userDetail.lockedUntil ? "Terkunci Sementara" : "Tidak Terkunci"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Tindakan Keamanan
              </span>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Cabut seluruh sesi login aktif jika pengguna melaporkan perangkat hilang atau
                anomali akses mencurigakan.
              </p>
            </div>
            <div className="pt-3">
              <Button
                type="button"
                variant="filled"
                color="error"
                size="sm"
                className="w-full"
                onClick={() => onRevokeSessions(userDetail.id)}
                loading={revoking}
                disabled={userDetail.activeSessions.length === 0}
                leftIcon={LogOut}
              >
                Cabut Semua Sesi ({userDetail.activeSessions.length})
              </Button>
            </div>
          </Card>
        </div>

        {/* Active Sessions List */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-800">
                Sesi Perangkat Aktif ({userDetail.activeSessions.length})
              </h4>
            </div>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Alamat IP</TableHeaderCell>
                <TableHeaderCell>User Agent / Perangkat</TableHeaderCell>
                <TableHeaderCell>Waktu Login</TableHeaderCell>
                <TableHeaderCell>Kedaluwarsa</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userDetail.activeSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                    Tidak ada sesi perangkat yang sedang aktif saat ini.
                  </TableCell>
                </TableRow>
              ) : (
                userDetail.activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs text-slate-800 font-medium">
                      {session.ipAddress || "Unknown IP"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {session.userAgent || "Unknown Device"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(session.createdAt).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(session.expiresAt).toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Recent Audit / Security Log */}
        <div>
          <div className="flex items-center gap-2 pb-3">
            <Clock className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-800">Histori Audit Keamanan Akun</h4>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Waktu</TableHeaderCell>
                <TableHeaderCell>Alamat IP</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Keterangan / Alasan</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userDetail.recentLoginAudits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                    Belum ada catatan aktivitas keamanan untuk akun ini.
                  </TableCell>
                </TableRow>
              ) : (
                userDetail.recentLoginAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {new Date(audit.createdAt).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-700">
                      {audit.ipAddress || "-"}
                    </TableCell>
                    <TableCell>
                      {audit.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <ShieldCheck className="w-3.5 h-3.5" /> Berhasil
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                          <AlertCircle className="w-3.5 h-3.5" /> Gagal
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {audit.failureReason || "Otentikasi / Operasi Normal"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Modal>
  );
};
