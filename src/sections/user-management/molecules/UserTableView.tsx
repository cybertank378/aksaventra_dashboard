"use client";

import { Edit3, Eye, KeyRound, LogOut, ShieldOff } from "lucide-react";
import type { UserRole } from "@/libs/enums";
import type { UserAdminItemDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import { ActiveSessionCounterChip } from "@/sections/user-management/atomic/ActiveSessionCounterChip";
import { UserStatusBadge } from "@/sections/user-management/atomic/UserStatusBadge";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import RoleBadge from "@/shared-ui/component/RoleBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

interface UserTableViewProps {
  users: UserAdminItemDTO[];
  totalUsers: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewDetail: (user: UserAdminItemDTO) => void;
  onEditUser: (user: UserAdminItemDTO) => void;
  onToggleStatus: (user: UserAdminItemDTO) => void;
  onRevokeSessions: (user: UserAdminItemDTO) => void;
  loading?: boolean;
}

export const UserTableView = ({
  users,
  totalUsers,
  currentPage,
  itemsPerPage,
  onPageChange,
  onViewDetail,
  onEditUser,
  onToggleStatus,
  onRevokeSessions,
  loading,
}: UserTableViewProps) => {
  return (
    <div className="space-y-4">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-12 text-center">No</TableHeaderCell>
            <TableHeaderCell>Nama & Email</TableHeaderCell>
            <TableHeaderCell>Role RBAC</TableHeaderCell>
            <TableHeaderCell>Status Akun</TableHeaderCell>
            <TableHeaderCell>Sesi Aktif</TableHeaderCell>
            <TableHeaderCell>Terakhir Login</TableHeaderCell>
            <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                Memuat data pengguna...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                Tidak ada pengguna yang sesuai dengan kriteria filter.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, idx) => {
              const rowIndex = (currentPage - 1) * itemsPerPage + idx + 1;
              return (
                <TableRow key={user.id} className="hover:bg-slate-50/75">
                  <TableCell className="text-center font-medium text-slate-500">
                    {rowIndex}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{user.email}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <RoleBadge role={user.role as UserRole} size="sm" />
                  </TableCell>

                  <TableCell>
                    <UserStatusBadge state={user.accountState} />
                  </TableCell>

                  <TableCell>
                    <ActiveSessionCounterChip count={user.activeSessionsCount} />
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-slate-600">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Belum pernah login"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(user)}
                        title="Lihat Detail & Sesi"
                        leftIcon={Eye}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser(user)}
                        title="Edit Profil/Role"
                        leftIcon={Edit3}
                      />

                      {user.accountState === "LOCKED" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(user)}
                          title="Buka Kunci Akun (Unlock)"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          leftIcon={KeyRound}
                        />
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(user)}
                          title={user.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                          className={
                            user.isActive
                              ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }
                          leftIcon={ShieldOff}
                        />
                      )}

                      {user.activeSessionsCount > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRevokeSessions(user)}
                          title={`Cabut ${user.activeSessionsCount} sesi aktif`}
                          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          leftIcon={LogOut}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalUsers > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalUsers}
          itemsPerPage={itemsPerPage}
          onPageChangeAction={onPageChange}
        />
      )}
    </div>
  );
};
