"use client";

import { RefreshCw, UserPlus } from "lucide-react";
import type { UserRole } from "@/libs/enums";
import type { UserAccountState } from "@/modules/users/domain/dto/UserResponseDTO";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import SearchField from "@/shared-ui/component/SearchField";
import SelectField from "@/shared-ui/component/SelectField";

interface UserFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  role: "ALL" | UserRole;
  onRoleChange: (role: "ALL" | UserRole) => void;
  accountState: "ALL" | UserAccountState;
  onAccountStateChange: (state: "ALL" | UserAccountState) => void;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  loading?: boolean;
}

export const UserFilterBar = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  accountState,
  onAccountStateChange,
  onRefresh,
  onOpenCreateModal,
  loading,
}: UserFilterBarProps) => {
  return (
    <Card className="p-4 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <SearchField
              value={search}
              onChange={onSearchChange}
              placeholder="Cari nama atau email..."
              size="sm"
            />
          </div>

          <div className="w-full sm:w-44">
            <SelectField
              size="sm"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as "ALL" | UserRole)}
            >
              <option value="ALL">Semua Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OPERATOR">OPERATOR</option>
              <option value="AUDITOR">AUDITOR</option>
              <option value="CLIENT">CLIENT</option>
            </SelectField>
          </div>

          <div className="w-full sm:w-48">
            <SelectField
              size="sm"
              value={accountState}
              onChange={(e) => onAccountStateChange(e.target.value as "ALL" | UserAccountState)}
            >
              <option value="ALL">Semua Status Akun</option>
              <option value="ACTIVE">Aktif</option>
              <option value="LOCKED">Terkunci</option>
              <option value="INACTIVE">Nonaktif</option>
            </SelectField>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            loading={loading}
            leftIcon={RefreshCw}
          >
            Segarkan
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            onClick={onOpenCreateModal}
            leftIcon={UserPlus}
          >
            Tambah Pengguna
          </Button>
        </div>
      </div>
    </Card>
  );
};
