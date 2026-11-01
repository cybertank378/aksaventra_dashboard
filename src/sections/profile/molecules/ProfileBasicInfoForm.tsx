import { Check, Mail, Save, User } from "lucide-react";
import { type ChangeEvent, type FC, type FormEvent, useState } from "react";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";

interface ProfileBasicInfoFormProps {
  initialName: string;
  email: string;
  onSaveName: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileBasicInfoForm: FC<ProfileBasicInfoFormProps> = ({
  initialName,
  email,
  onSaveName,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
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
      await onSaveName(name.trim());
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil");
    }
  };

  const hasChanged = name.trim() !== initialName.trim();

  return (
    <Card className="p-6 border border-slate-200/90 shadow-xs bg-white rounded-2xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
        1. Informasi Profil Dasar
      </h3>
      <p className="text-xs text-slate-500 mb-5">
        Perbarui nama tampilan identitas Anda yang akan tercatat di log audit administratif
      </p>

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
              <Check size={14} /> Profil berhasil disimpan!
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
