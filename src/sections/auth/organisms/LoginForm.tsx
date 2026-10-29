"use client";

import { ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import AuthCheckbox from "@/sections/auth/atoms/AuthCheckbox";
import AuthTextField from "@/sections/auth/atoms/AuthTextField";
import Button from "@/shared-ui/component/Button";
import LinkButton from "@/shared-ui/component/LinkButton";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ redirectTo = "/dashboard", onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthApi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRememberMeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async () => {
    clearError();
    setIsSuccess(false);

    if (!email.trim() || !password.trim()) {
      showErrorToast("Alamat email dan kata sandi wajib diisi.");
      return;
    }

    const result = await login({
      email: email.trim(),
      password,
      rememberMe,
    });

    if (result) {
      setIsSuccess(true);
      showSuccessToast("Autentikasi berhasil. Mengalihkan ke Dasbor Manajemen Lisensi...");
      onSuccess?.();
      router.push(redirectTo);
      router.refresh();
    } else {
      showErrorToast("Gagal masuk. Periksa kembali kredensial Anda.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          AUTENTIKASI PORTAL
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Masuk ke Akun Administrator
        </h2>
        <p className="text-sm text-slate-500">
          Masukkan kredensial Anda untuk mengelola direktori lisensi.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          Autentikasi berhasil. Mengarahkan ke Dasbor Manajemen Lisensi...
        </div>
      )}

      {/* FORM FIELDS */}
      <div className="space-y-4">
        <AuthTextField
          label="Alamat Email"
          type="email"
          placeholder="admin@aksaventra.com"
          leftIcon={Mail}
          rightIcon={isEmailValid ? CheckCircle2 : undefined}
          value={email}
          onChange={handleEmailChange}
          className={
            isEmailValid
              ? "border-indigo-600 bg-white ring-2 ring-indigo-100 [&_button]:text-emerald-500"
              : undefined
          }
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Kata Sandi</span>
            <LinkButton
              href="/forgot-password"
              variant="text"
              color="secondary"
              size="sm"
              className="!px-0 !py-0 text-xs font-bold !text-indigo-600 hover:!bg-transparent hover:!text-indigo-700"
            >
              Lupa kata sandi?
            </LinkButton>
          </div>

          <AuthTextField
            type="password"
            placeholder="••••••••••••••••"
            leftIcon={Lock}
            enablePasswordToggle
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
      </div>

      {/* REMEMBER DEVICE */}
      <div className="flex items-center justify-between">
        <AuthCheckbox
          label="Ingat perangkat ini selama 30 hari"
          checked={rememberMe}
          onChange={handleRememberMeChange}
        />
      </div>

      {/* PRIMARY SUBMIT BUTTON */}
      <Button
        variant="filled"
        color="primary"
        size="lg"
        fullWidth
        rightIcon={ArrowRight}
        loading={loading}
        onClick={handleSubmit}
        className="!rounded-xl !bg-indigo-600 py-3.5 text-sm font-semibold shadow-md shadow-indigo-600/20 hover:!bg-indigo-700 active:!bg-indigo-800"
      >
        Masuk ke Dasbor Manajemen Lisensi
      </Button>

      <div className="flex items-center justify-center gap-1 pt-1 text-xs text-slate-500">
        <span>Belum memiliki akun administrator?</span>
        <LinkButton
          href="/register"
          variant="text"
          color="secondary"
          size="sm"
          className="!px-1 !py-0 text-xs font-bold !text-indigo-600 hover:!bg-transparent"
        >
          Daftar Sekarang
        </LinkButton>
      </div>
    </div>
  );
}
