import { CheckCircle2, Power } from "lucide-react";
import type { FC } from "react";
import type { UserProfileResponseDTO } from "@/modules/auth/domain/dto/ProfileDTO";
import { roleConfig } from "@/security/rbacConfig";
import Avatar from "@/shared-ui/component/Avatar";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import { ProfilePermissionChip } from "../atomic/ProfilePermissionChip";

interface ProfileIdentityCardProps {
  profile: UserProfileResponseDTO;
  onRevokeAllOtherSessions: () => void;
  isRevokingAll?: boolean;
}

export const ProfileIdentityCard: FC<ProfileIdentityCardProps> = ({
  profile,
  onRevokeAllOtherSessions,
  isRevokingAll = false,
}) => {
  const roleLabel = roleConfig[profile.role]?.label || profile.role;

  const lastLoginFormatted = profile.lastLoginAt
    ? `${new Date(profile.lastLoginAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} WIB`
    : "Belum pernah login";

  const otherSessionsCount = Math.max(0, profile.sessions.length - 1);

  return (
    <Card className="p-6 border border-slate-200/90 shadow-xs bg-white rounded-2xl flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* User Identity Header */}
        <div className="flex items-start gap-4">
          <Avatar
            name={profile.name || profile.email}
            image={profile.image}
            size="lg"
            className="bg-blue-600 text-white shrink-0 text-xl font-bold"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                color="success"
                variant="soft"
                className="text-[11px] py-0.5 px-2 font-medium flex items-center gap-1"
              >
                <CheckCircle2 size={12} />
                Email Terverifikasi
              </Badge>
            </div>

            <h2 className="text-base font-extrabold text-slate-900 truncate mt-1.5">
              {profile.name || "Nama Belum Diatur"}
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{profile.email}</p>
          </div>
        </div>

        {/* User Metadata Overview */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Role RBAC:</span>
            <span className="font-bold text-slate-800">{roleLabel}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Login Terakhir:</span>
            <span className="font-semibold text-slate-700">{lastLoginFormatted}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Sesi Perangkat Aktif:</span>
            <span className="font-bold text-blue-600">{profile.sessions.length} Sesi Aktif</span>
          </div>
        </div>

        {/* Permissions List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            Izin Aktif (Permissions.ts)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.permissions.map((perm) => (
              <ProfilePermissionChip key={perm} permission={perm} />
            ))}
          </div>
        </div>
      </div>

      {/* Revoke All Action */}
      <div className="pt-6 border-t border-slate-100 mt-6">
        <Button
          type="button"
          variant="outline"
          color="error"
          fullWidth
          leftIcon={Power}
          onClick={onRevokeAllOtherSessions}
          disabled={isRevokingAll || otherSessionsCount === 0}
        >
          {isRevokingAll
            ? "Memproses Pemutusan..."
            : otherSessionsCount > 0
              ? `Putuskan Semua Sesi Perangkat Lain (${otherSessionsCount})`
              : "Tidak Ada Sesi Lain"}
        </Button>
      </div>
    </Card>
  );
};
