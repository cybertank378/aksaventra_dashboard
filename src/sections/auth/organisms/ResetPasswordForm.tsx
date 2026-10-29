"use client";

import clsx from "clsx";
import { Check, CheckCheck, KeyRound, Lock, LockOpen, Ticket } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import AuthCheckbox from "@/sections/auth/atoms/AuthCheckbox";
import AuthTextField from "@/sections/auth/atoms/AuthTextField";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import LinkButton from "@/shared-ui/component/LinkButton";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export interface ResetPasswordFormProps {
  initialToken?: string;
}

export default function ResetPasswordForm({ initialToken = "" }: ResetPasswordFormProps) {
  const { resetPassword, logoutAll, loading, error, clearError } = useAuthApi();

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forceLogoutOtherDevices, setForceLogoutOtherDevices] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleForceLogoutChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForceLogoutOtherDevices(e.target.checked);
  };

  // Password requirement checks
  const hasMinLength = newPassword.length >= 12;
  const hasMixedCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(newPassword);
  const isDifferentFromToken = newPassword.length > 0 && newPassword !== token.trim();

  const requirements = [
    { id: "min-length", label: "Minimal 12 karakter panjang sandi", met: hasMinLength },
    { id: "mixed-case", label: "Kombinasi huruf BESAR & huruf kecil", met: hasMixedCase },
    { id: "has-number", label: "Minimal mengandung 1 angka (0-9)", met: hasNumber },
    { id: "special-char", label: "Minimal 1 simbol khusus (!@#$%^&*)", met: hasSpecialChar },
    {
      id: "history-diff",
      label: "Berbeda dari 5 riwayat sandi terakhir",
      met: isDifferentFromToken,
    },
  ];

  const metCount = requirements.filter((item) => item.met).length;
  const strengthBars =
    newPassword.length === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((metCount / 5) * 4)));
  const entropyBits = newPassword.length * 5;

  const strengthLabel =
    strengthBars >= 4
      ? `Kekuatan Sandi: Sangat Kuat (Entropi ${entropyBits}-bit)`
      : strengthBars === 3
        ? `Kekuatan Sandi: Kuat (Entropi ${entropyBits}-bit)`
        : strengthBars === 2
          ? `Kekuatan Sandi: Sedang (Entropi ${entropyBits}-bit)`
          : strengthBars === 1
            ? `Kekuatan Sandi: Lemah (Entropi ${entropyBits}-bit)`
            : "Kekuatan Sandi: Belum Diisi";

  const isTokenValid = token.trim().length >= 6;
  const isConfirmMatch = confirmPassword.length > 0 && confirmPassword === newPassword;

  const handleSubmit = async () => {
    clearError();
    setIsSuccess(false);

    if (!token.trim() || !newPassword) {
      showErrorToast("Token otorisasi dan kata sandi baru wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    const result = await resetPassword({
      token: token.trim(),
      newPassword,
    });

    if (result) {
      if (forceLogoutOtherDevices) {
        await logoutAll();
      }
      setIsSuccess(true);
      showSuccessToast(result.message ?? "Kata sandi berhasil diperbarui. Silakan login kembali.");
    } else {
      showErrorToast("Gagal memperbarui kata sandi. Periksa kembali token otorisasi Anda.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12">
      {/* LEFT PANEL: PASSWORD RESET / UPDATE FORM */}
      <div className="space-y-5 p-6 sm:p-10 lg:col-span-7">
        {/* STEP HEADER */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <LockOpen size={22} />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              LANGKAH 3 DARI 3 • KEAMANAN AKUN
            </p>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Atur Kata Sandi Baru Anda
            </h2>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
            Kata sandi Anda telah berhasil diperbarui. Silakan masuk kembali menggunakan sandi baru.
          </div>
        )}

        {/* FIELD 1: TOKEN OTORISASI / KATA SANDI LAMA */}
        <div className="relative">
          <AuthTextField
            label="Kata Sandi Lama / Token Otorisasi"
            placeholder="TOKEN-REC-2026-VERIFIED"
            leftIcon={Ticket}
            value={token}
            onChange={handleTokenChange}
            className={
              isTokenValid
                ? "border-emerald-300 bg-emerald-50/40 pr-24 text-emerald-950 [&_svg]:text-emerald-600"
                : undefined
            }
          />

          {isTokenValid && (
            <div className="pointer-events-none absolute bottom-2.5 right-3">
              <Badge
                color="success"
                variant="outline"
                className="rounded-md !border-emerald-200 !bg-white px-2.5 py-0.5 text-[11px] font-bold !text-emerald-700"
              >
                Valid
              </Badge>
            </div>
          )}
        </div>

        {/* FIELD 2: KATA SANDI BARU + STRENGTH METER */}
        <div className="space-y-2">
          <AuthTextField
            label={
              <span>
                Kata Sandi Baru <span className="text-red-500">*</span>
              </span>
            }
            type="password"
            placeholder="Minimal 12 karakter kombinasi huruf, angka & simbol"
            leftIcon={KeyRound}
            enablePasswordToggle
            value={newPassword}
            onChange={handleNewPasswordChange}
            className={
              newPassword.length > 0
                ? "border-indigo-600 bg-white ring-2 ring-indigo-100 [&_svg]:text-indigo-600"
                : undefined
            }
          />

          {/* 4-SEGMENT STRENGTH BAR */}
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            {[1, 2, 3, 4].map((segment) => (
              <div
                key={segment}
                className={clsx(
                  "h-1.5 rounded-full transition-colors",
                  strengthBars >= segment ? "bg-emerald-500" : "bg-slate-200",
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span
              className={clsx(
                "font-bold",
                strengthBars >= 3
                  ? "text-emerald-600"
                  : strengthBars >= 2
                    ? "text-amber-600"
                    : "text-slate-500",
              )}
            >
              {strengthLabel}
            </span>
            <span className="font-medium text-slate-400">{newPassword.length} Karakter</span>
          </div>
        </div>

        {/* FIELD 3: KONFIRMASI KATA SANDI BARU */}
        <div className="relative">
          <AuthTextField
            label={
              <span>
                Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
              </span>
            }
            type="password"
            placeholder="Ulangi kata sandi baru Anda"
            leftIcon={CheckCheck}
            enablePasswordToggle={!isConfirmMatch}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={
              isConfirmMatch
                ? "border-emerald-300 bg-slate-50/70 pr-24 [&_svg]:text-emerald-600"
                : undefined
            }
          />

          {isConfirmMatch && (
            <div className="pointer-events-none absolute bottom-2.5 right-3">
              <Badge
                color="success"
                variant="soft"
                className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700"
              >
                Cocok
              </Badge>
            </div>
          )}
        </div>

        {/* FORCE LOGOUT SESSIONS BOX */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <AuthCheckbox
            label="Putuskan semua sesi perangkat aktif lainnya (Force Logout)"
            description="Mencabut token akses aktif di perangkat lain setelah sandi diperbarui."
            checked={forceLogoutOtherDevices}
            onChange={handleForceLogoutChange}
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 pt-1">
          <LinkButton
            href="/login"
            variant="outline"
            color="secondary"
            size="lg"
            className="!rounded-xl !border-slate-200 !bg-white px-6 py-3.5 text-xs font-bold !text-slate-700 hover:!bg-slate-50"
          >
            Batal
          </LinkButton>

          <Button
            variant="filled"
            color="primary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleSubmit}
            className="!rounded-xl !bg-indigo-600 py-3.5 text-sm font-semibold shadow-md shadow-indigo-600/20 hover:!bg-indigo-700 active:!bg-indigo-800"
          >
            Simpan &amp; Perbarui Kata Sandi
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: CRYPTOGRAPHIC PASSWORD REQUIREMENTS */}
      <div className="flex flex-col justify-between border-t border-slate-200 bg-slate-50/60 p-6 sm:p-9 lg:col-span-5 lg:border-l lg:border-t-0">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              STANDAR KRIPTOGRAFI KEAMANAN
            </p>
            <h3 className="text-base font-extrabold text-slate-900">Persyaratan Kata Sandi</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Kata sandi administrator wajib memenuhi seluruh parameter berikut:
            </p>
          </div>

          <div className="space-y-2.5">
            {requirements.map((req) => (
              <div
                key={req.id}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors",
                  req.met
                    ? "border-emerald-200 bg-white text-slate-800 shadow-2xs"
                    : "border-slate-200/80 bg-white/70 text-slate-500",
                )}
              >
                <span
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    req.met ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400",
                  )}
                >
                  <Check size={12} />
                </span>
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ARGON2ID HASH STORAGE INFO BOX */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
            <Lock size={14} className="text-indigo-600" />
            <span>Penyimpanan Argon2id Hash</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-900/80">
            Kata sandi Anda di-hash menggunakan algoritma Khusus dan unik sebelum disimpan di
            brankas keamanan Aksaventra.
          </p>
        </div>
      </div>
    </div>
  );
}
