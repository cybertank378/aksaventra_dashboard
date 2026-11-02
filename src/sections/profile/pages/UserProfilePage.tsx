"use client";

import type { FC } from "react";
import { UserProfileOrganism } from "../organisms/UserProfileOrganism";

export const UserProfilePage: FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <nav className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
          <span>Dasbor</span>
          <span>/</span>
          <span>Akun Pengguna</span>
          <span>/</span>
          <span className="text-blue-600">Profil & Keamanan Sesi</span>
        </nav>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Profil Akun & Pengaturan Keamanan Pribadi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola identitas akun personel, pembaruan kata sandi Argon2id, dan perangkat yang sedang
          login
        </p>
      </div>

      {/* Main Organism Content */}
      <UserProfileOrganism />
    </div>
  );
};

export default UserProfilePage;
