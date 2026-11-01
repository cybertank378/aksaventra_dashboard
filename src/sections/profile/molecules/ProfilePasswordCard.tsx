import { ChevronDown, ChevronUp, KeyRound } from "lucide-react";
import { type FC, useState } from "react";
import ChangePasswordForm from "@/sections/auth/organisms/ChangePasswordForm";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

interface ProfilePasswordCardProps {
  userId: string;
}

export const ProfilePasswordCard: FC<ProfilePasswordCardProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="p-6 border border-slate-200/90 shadow-xs bg-white rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            3. Keamanan Kata Sandi (Argon2id)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbarui kata sandi akun Anda menggunakan algoritma hashing Argon2id standar OWASP
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={KeyRound}
          rightIcon={isOpen ? ChevronUp : ChevronDown}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Tutup Formulir" : "Ubah Kata Sandi"}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <ChangePasswordForm userId={userId} onSuccess={() => setIsOpen(false)} />
        </div>
      )}
    </Card>
  );
};
