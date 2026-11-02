"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import type { CreateUserDTO, UpdateUserDTO } from "@/modules/users/domain/dto/UserRequestDTO";
import type { UserAdminItemDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import { RolePermissionSummaryBox } from "@/sections/user-management/atomic/RolePermissionSummaryBox";
import { Modal } from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitCreate?: (dto: CreateUserDTO) => Promise<void>;
  onSubmitUpdate?: (id: string, dto: UpdateUserDTO) => Promise<void>;
  userToEdit?: UserAdminItemDTO | null;
  loading?: boolean;
}

export const UserFormModal = ({
  open,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  userToEdit,
  loading,
}: UserFormModalProps) => {
  const isEditing = Boolean(userToEdit);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("OPERATOR");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("OPERATOR");
    }
    setErrorMessage(null);
  }, [userToEdit]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Nama lengkap wajib diisi");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Alamat email wajib diisi");
      return;
    }

    try {
      if (isEditing && userToEdit) {
        if (onSubmitUpdate) {
          await onSubmitUpdate(userToEdit.id, {
            name: name.trim(),
            email: email.trim(),
            role,
          });
        }
      } else {
        if (!password) {
          setErrorMessage("Password wajib diisi untuk pengguna baru");
          return;
        }
        if (onSubmitCreate) {
          await onSubmitCreate({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          });
        }
      }
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Profil & Role Pengguna" : "Tambah Pengguna Baru"}
      subtitle={
        isEditing
          ? `Perbarui informasi akun pengguna ${userToEdit?.email}`
          : "Daftarkan akun dashboard baru dengan role RBAC yang sesuai"
      }
      size="lg"
      onSubmit={handleSubmit}
      submitText={isEditing ? "Simpan Perubahan" : "Buat Akun"}
      submitLoading={loading}
      submitColor="primary"
    >
      <div className="space-y-4 py-2">
        {errorMessage && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Nama Lengkap"
            placeholder="misal: Bambang Sudarsono"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <TextField
            label="Alamat Email"
            type="email"
            placeholder="misal: bambang@aksaventra.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {!isEditing && (
          <TextField
            label="Password Awal"
            type="password"
            enablePasswordToggle
            placeholder="Minimal 8 karakter, huruf kapital & angka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Gunakan kata sandi kuat dengan kombinasi huruf kapital dan angka."
            disabled={loading}
          />
        )}

        <div>
          <SelectField
            label="Role & Hak Akses"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={loading}
          >
            <option value="ADMIN">ADMIN - Kontrol Penuh Lisensi & Pengguna</option>
            <option value="OPERATOR">OPERATOR - Pemantau Validasi & Telemetri</option>
            <option value="AUDITOR">AUDITOR - Auditor Log & Anomali Sistem</option>
            <option value="CLIENT">CLIENT - Portal Pelanggan / Pemilik Lisensi</option>
          </SelectField>
        </div>

        <div className="pt-2">
          <RolePermissionSummaryBox role={role} />
        </div>
      </div>
    </Modal>
  );
};
