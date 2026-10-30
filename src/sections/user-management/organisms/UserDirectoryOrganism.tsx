"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import type { CreateUserDTO, UpdateUserDTO } from "@/modules/users/domain/dto/UserRequestDTO";
import type {
  UserAccountState,
  UserAdminItemDTO,
} from "@/modules/users/domain/dto/UserResponseDTO";
import { useUserApi } from "@/modules/users/presentation/hooks/useUserApi";
import { UserDetailModal } from "@/sections/user-management/molecules/UserDetailModal";
import { UserFilterBar } from "@/sections/user-management/molecules/UserFilterBar";
import { UserFormModal } from "@/sections/user-management/molecules/UserFormModal";
import { UserStatsGrid } from "@/sections/user-management/molecules/UserStatsGrid";
import { UserTableView } from "@/sections/user-management/molecules/UserTableView";

export const UserDirectoryOrganism = () => {
  const {
    usersData,
    statsData,
    selectedUserDetail,
    setSelectedUserDetail,
    loading,
    fetchUsers,
    fetchStats,
    fetchUserDetail,
    createUser,
    updateUser,
    updateUserStatus,
    revokeUserSessions,
  } = useUserApi();

  // Filters State
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [accountState, setAccountState] = useState<"ALL" | UserAccountState>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAdminItemDTO | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Initial load & search/filter watcher
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers({
      page: currentPage,
      limit: itemsPerPage,
      search: search.trim() || undefined,
      role,
      accountState,
    });
  }, [fetchUsers, currentPage, search, role, accountState]);

  const handleRefresh = () => {
    fetchStats();
    fetchUsers({
      page: currentPage,
      limit: itemsPerPage,
      search: search.trim() || undefined,
      role,
      accountState,
    });
  };

  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: UserAdminItemDTO) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = async (user: UserAdminItemDTO) => {
    await fetchUserDetail(user.id);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = async (user: UserAdminItemDTO) => {
    const isLocked = user.accountState === "LOCKED";
    const confirmMessage = isLocked
      ? `Buka kunci akun untuk ${user.email}?`
      : user.isActive
        ? `Nonaktifkan akun ${user.email}? Seluruh sesi aktif pengguna ini akan otomatis dicabut.`
        : `Aktifkan kembali akun ${user.email}?`;

    if (!window.confirm(confirmMessage)) return;

    if (isLocked) {
      await updateUserStatus(user.id, { unlock: true });
    } else {
      await updateUserStatus(user.id, {
        isActive: !user.isActive,
        reason: user.isActive ? "Penonaktifan administratif dashboard" : "Re-aktivasi operasional",
      });
    }

    handleRefresh();
  };

  const handleRevokeSessions = async (userId: string) => {
    if (!window.confirm("Cabut semua sesi aktif perangkat untuk pengguna ini?")) return;

    try {
      setIsRevoking(true);
      await revokeUserSessions(userId);
      await fetchUserDetail(userId);
      handleRefresh();
    } finally {
      setIsRevoking(false);
    }
  };

  const handleSubmitCreate = async (dto: CreateUserDTO) => {
    await createUser(dto);
    handleRefresh();
  };

  const handleSubmitUpdate = async (id: string, dto: UpdateUserDTO) => {
    await updateUser(id, dto);
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Metric Stats */}
      <UserStatsGrid stats={statsData} loading={loading} />

      {/* Filter & Action Bar */}
      <UserFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        role={role}
        onRoleChange={(val) => {
          setRole(val);
          setCurrentPage(1);
        }}
        accountState={accountState}
        onAccountStateChange={(val) => {
          setAccountState(val);
          setCurrentPage(1);
        }}
        onRefresh={handleRefresh}
        onOpenCreateModal={handleOpenCreateModal}
        loading={loading}
      />

      {/* Main Table View */}
      <UserTableView
        users={usersData?.users || []}
        totalUsers={usersData?.pagination.total || 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onViewDetail={handleViewDetail}
        onEditUser={handleEditUser}
        onToggleStatus={handleToggleStatus}
        onRevokeSessions={(user) => handleRevokeSessions(user.id)}
        loading={loading}
      />

      {/* Create / Edit Form Modal */}
      <UserFormModal
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmitCreate={handleSubmitCreate}
        onSubmitUpdate={handleSubmitUpdate}
        userToEdit={userToEdit}
        loading={loading}
      />

      {/* Detail & Active Session Inspector Modal */}
      <UserDetailModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUserDetail(null);
        }}
        userDetail={selectedUserDetail}
        onRevokeSessions={handleRevokeSessions}
        revoking={isRevoking}
      />
    </div>
  );
};
