"use client";

import { ArrowLeft, Mail, MailCheck, Send, Shield } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import AuthTextField from "@/sections/auth/atoms/AuthTextField";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import LinkButton from "@/shared-ui/component/LinkButton";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgetPasswordForm() {
  const { forgotPassword, loading, error, clearError } = useAuthApi();

  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (isSuccess) setIsSuccess(false);
  };

  const handleSubmit = async () => {
    clearError();
    setIsSuccess(false);

    if (!email.trim()) {
      showErrorToast("Email administrator terdaftar wajib diisi.");
      return;
    }

    const result = await forgotPassword({
      email: email.trim(),
    });

    if (result) {
      setIsSuccess(true);
      showSuccessToast(
        result.message ?? "Tautan pemulihan kata sandi telah dikirim ke email Anda.",
      );
    } else {
      showErrorToast("Gagal memproses permintaan pemulihan kata sandi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP ICON + STEP HEADER */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/80 text-indigo-600">
          <MailCheck size={22} />
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            LANGKAH 1 DARI 3 • PEMULIHAN AKUN
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Lupa Kata Sandi Administrator?
          </h2>
          <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
            Masukkan alamat email yang terdaftar. Sistem Aksaventra akan mengirimkan tautan
            pemulihan terenkripsi sekali pakai (One-Time Recovery Link).
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          Tautan pemulihan sekali pakai telah dikirim ke email administrator Anda.
        </div>
      )}

      {/* REGISTERED ADMIN EMAIL FIELD WITH "AKUN DITEMUKAN" BADGE */}
      <div className="relative">
        <AuthTextField
          label={
            <span>
              Email Administrator Terdaftar <span className="text-red-500">*</span>
            </span>
          }
          type="email"
          placeholder="admin@aksaventra.com"
          leftIcon={Mail}
          value={email}
          onChange={handleEmailChange}
          className={
            isEmailValid
              ? "border-indigo-600 bg-white pr-36 ring-2 ring-indigo-100 [&_svg]:text-indigo-600"
              : undefined
          }
        />

        {isSuccess && isEmailValid && (
          <div className="pointer-events-none absolute bottom-2.5 right-3">
            <Badge
              color="success"
              variant="soft"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
            >
              Akun Ditemukan
            </Badge>
          </div>
        )}
      </div>

      {/* AMBER SECURITY PROTOCOL ALERT BOX */}
      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="space-y-1.5 text-xs text-amber-900">
            <p className="font-bold text-amber-950">Protokol Keamanan Pemulihan Akses</p>
            <ul className="list-disc space-y-1 pl-4 text-amber-800/95">
              <li>
                Tautan token pemulihan hanya berlaku selama{" "}
                <span className="font-bold text-amber-950">15 menit</span> sejak dikirimkan.
              </li>
              <li>
                Permintaan ini dicatat secara otomatis pada{" "}
                <span className="font-bold text-amber-950">Audit Log Keamanan</span> beserta alamat
                IP Anda (<span className="font-mono">103.28.14.90</span>).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="space-y-3 pt-1">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          fullWidth
          leftIcon={Send}
          loading={loading}
          onClick={handleSubmit}
          className="!rounded-xl !bg-indigo-600 py-3.5 text-sm font-semibold shadow-md shadow-indigo-600/20 hover:!bg-indigo-700 active:!bg-indigo-800"
        >
          Kirim Tautan Pemulihan Kata Sandi
        </Button>

        <LinkButton
          href="/login"
          variant="outline"
          color="secondary"
          size="lg"
          fullWidth
          leftIcon={ArrowLeft}
          className="!rounded-xl !border-slate-200 !bg-white py-3 text-xs font-bold !text-slate-700 hover:!bg-slate-50"
        >
          Kembali ke Halaman Login
        </LinkButton>
      </div>
    </div>
  );
}
