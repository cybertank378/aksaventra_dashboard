"use client";

import { Camera, Check, Mail, Save, Trash2, UploadCloud, User } from "lucide-react";
import { type ChangeEvent, type FC, type FormEvent, useRef, useState } from "react";
import Avatar from "@/shared-ui/component/Avatar";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";

interface ProfileBasicInfoFormProps {
  initialName: string;
  email: string;
  initialImage?: string | null;
  onSaveProfile: (name: string, image?: string | null) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileBasicInfoForm: FC<ProfileBasicInfoFormProps> = ({
  initialName,
  email,
  initialImage = null,
  onSaveProfile,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialName);
  const [avatarImage, setAvatarImage] = useState<string | null>(initialImage ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError(null);
    if (isSuccess) setIsSuccess(false);
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Berkas yang dipilih harus berupa gambar (JPG, PNG, atau WebP)");
      return;
    }

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto profil maksimal 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarImage(reader.result);
        if (error) setError(null);
        if (isSuccess) setIsSuccess(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarImage(null);
    if (error) setError(null);
    if (isSuccess) setIsSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Nama lengkap minimal 2 karakter");
      return;
    }

    try {
      await onSaveProfile(name.trim(), avatarImage);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil");
    }
  };

  const hasChanged = name.trim() !== initialName.trim() || avatarImage !== (initialImage ?? null);

  return (
    <Card className="p-6 border border-slate-200/90 shadow-xs bg-white rounded-2xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
        1. Informasi Profil Dasar & Foto Avatar
      </h3>
      <p className="text-xs text-slate-500 mb-5">
        Perbarui nama tampilan dan foto avatar identitas Anda yang akan tercatat di log audit
        administratif
      </p>

      {/* Bagian Ganti Foto Avatar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="relative group shrink-0">
          <Avatar
            name={name.trim() || initialName || email}
            image={avatarImage}
            size="xl"
            className="border-2 border-white shadow-sm ring-2 ring-slate-200 text-xl font-bold"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1.5 text-white shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Pilih foto baru"
          >
            <Camera size={14} />
          </button>
        </div>

        <div className="flex-1 space-y-1.5">
          <h4 className="text-xs font-bold text-slate-800">Foto Avatar Personel</h4>
          <p className="text-[11px] text-slate-500">
            Unggah foto profil dalam format JPG, PNG, atau WebP (Maksimal 2 MB). Foto akan
            ditampilkan pada topbar dan kartu profil.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarFileChange}
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={UploadCloud}
              onClick={() => fileInputRef.current?.click()}
            >
              Pilih Foto Avatar
            </Button>

            {avatarImage && (
              <Button
                type="button"
                variant="ghost"
                color="error"
                size="sm"
                leftIcon={Trash2}
                onClick={handleRemoveAvatar}
              >
                Hapus Foto (Gunakan Inisial)
              </Button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Nama Lengkap Personel"
            placeholder="Masukkan nama lengkap..."
            value={name}
            onChange={handleNameChange}
            error={error ?? undefined}
            leftIcon={User}
            size="md"
            required
          />

          <TextField
            label="Alamat Email (Identitas Login)"
            value={email}
            disabled
            leftIcon={Mail}
            helperText="Alamat email terverifikasi tidak dapat diubah langsung"
            size="md"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {isSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 animate-fadeIn">
              <Check size={14} /> Profil & avatar berhasil disimpan!
            </span>
          )}

          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Save}
            loading={isLoading}
            disabled={!hasChanged || isLoading}
          >
            Simpan Profil
          </Button>
        </div>
      </form>
    </Card>
  );
};
