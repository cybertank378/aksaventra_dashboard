"use client";

import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import AuthTextField from "@/sections/auth/atoms/AuthTextField";
import Button from "@/shared-ui/component/Button";
import LinkButton from "@/shared-ui/component/LinkButton";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export interface VerifyEmailFormProps {
  initialToken?: string;
}

export default function VerifyEmailForm({ initialToken = "" }: VerifyEmailFormProps) {
  const { verifyEmail, sendVerification, loading, error, clearError } = useAuthApi();

  const [token, setToken] = useState(initialToken);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleVerify = async () => {
    clearError();
    setIsSuccess(false);

    if (!token.trim()) {
      showErrorToast("Token verifikasi email wajib diisi.");
      return;
    }

    const result = await verifyEmail({
      token: token.trim(),
    });

    if (result) {
      setIsSuccess(true);
      showSuccessToast(result.message ?? "Alamat email berhasil diverifikasi.");
    } else {
      showErrorToast("Token verifikasi tidak valid atau telah kedaluwarsa.");
    }
  };

  const handleResend = async () => {
    clearError();
    const result = await sendVerification();
    if (result) {
      showSuccessToast(result.message ?? "Token verifikasi baru telah dikirim.");
    } else {
      showErrorToast("Gagal mengirim ulang email verifikasi.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Verifikasi Email Akun</h2>
        <p className="mt-1 text-sm text-slate-500">
          Masukkan kode token verifikasi untuk mengaktifkan kredensial Aksaventra Enterprise Anda
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 size={16} />
          <span>Verifikasi email berhasil! Akun Anda kini telah aktif.</span>
        </div>
      )}

      <AuthTextField
        label="Token Verifikasi Email"
        placeholder="Masukkan token verifikasi"
        value={token}
        onChange={handleTokenChange}
        helperText="Periksa tautan atau kode yang dikirim ke email terdaftar Anda"
      />

      <div className="space-y-3">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          fullWidth
          leftIcon={ShieldCheck}
          loading={loading}
          onClick={handleVerify}
        >
          Verifikasi Email Sekarang
        </Button>

        <Button
          variant="outline"
          color="secondary"
          size="md"
          fullWidth
          leftIcon={RefreshCw}
          disabled={loading}
          onClick={handleResend}
        >
          Kirim Ulang Token Verifikasi
        </Button>
      </div>

      <div className="flex justify-center pt-2">
        <LinkButton href="/login" variant="text" color="primary" size="sm">
          Kembali ke Halaman Login
        </LinkButton>
      </div>
    </div>
  );
}
