"use client";

import { Smartphone, UserCheck, Users, UserX } from "lucide-react";
import type { UserStatsResponseDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import LicenseMetricCard from "@/sections/license-management/atomic/LicenseMetricCard";

interface UserStatsGridProps {
  stats: UserStatsResponseDTO | null;
  loading?: boolean;
}

export const UserStatsGrid = ({ stats, loading }: UserStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <LicenseMetricCard
        title="Total Pengguna"
        value={loading || !stats ? "..." : stats.totalUsers}
        subtitle="Akun terdaftar dalam sistem"
        badgeText={`${stats?.roleCounts.ADMIN ?? 0} Admin`}
        badgeColor="primary"
        icon={Users}
      />

      <LicenseMetricCard
        title="Pengguna Aktif"
        value={loading || !stats ? "..." : stats.activeUsers}
        subtitle="Dapat login ke dashboard"
        badgeText="Operasional"
        badgeColor="success"
        icon={UserCheck}
      />

      <LicenseMetricCard
        title="Terkunci / Nonaktif"
        value={loading || !stats ? "..." : stats.lockedOrInactiveUsers}
        subtitle="Akses ditangguhkan / gagal login"
        badgeText={stats?.lockedOrInactiveUsers ? "Perlu Ditinjau" : "Bersih"}
        badgeColor={stats?.lockedOrInactiveUsers ? "error" : "secondary"}
        icon={UserX}
      />

      <LicenseMetricCard
        title="Sesi Aktif"
        value={loading || !stats ? "..." : stats.activeSessionsCount}
        subtitle="Perangkat terotentikasi aktif"
        badgeText="Real-time"
        badgeColor="info"
        icon={Smartphone}
      />
    </div>
  );
};
