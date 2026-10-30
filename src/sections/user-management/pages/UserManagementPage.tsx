"use client";

import { UserDirectoryOrganism } from "@/sections/user-management/organisms/UserDirectoryOrganism";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Manajemen Pengguna & Hak Akses
        </h1>
        <p className="text-sm text-slate-500">
          Kelola kredensial pengguna, peran RBAC (Admin, Operator, Auditor), status akun, serta
          pantau dan cabut sesi perangkat yang terotentikasi.
        </p>
      </div>

      <UserDirectoryOrganism />
    </div>
  );
}
