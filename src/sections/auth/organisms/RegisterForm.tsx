"use client";

import { ArrowRight, KeyRound, Mail, User } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import AuthCheckbox from "@/sections/auth/atoms/AuthCheckbox";
import AuthTextField from "@/sections/auth/atoms/AuthTextField";
import TermsConditionsModal from "@/sections/auth/molecules/TermsConditionsModal";
import Button from "@/shared-ui/component/Button";
import LinkButton from "@/shared-ui/component/LinkButton";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export default function RegisterForm() {
  const { register, loading, error, clearError } = useAuthApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleAcceptedTermsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
  };

  const handleOpenTermsModal = () => {
    setTermsModalOpen(true);
  };

  const handleCloseTermsModal = () => {
    setTermsModalOpen(false);
  };

  const handleAcceptTermsModal = () => {
    setAcceptedTerms(true);
  };

  const handleSubmit = async () => {
    clearError();
    setIsSuccess(false);

    if (!email.trim() || !password) {
      showErrorToast("Nama, alamat email, dan kata sandi wajib diisi.");
      return;
    }

    if (!acceptedTerms) {
      showErrorToast("Anda wajib menyetujui Ketentuan Layanan SLA Aksaventra Enterprise.");
      return;
    }

    const result = await register({
      name: name.trim() || undefined,
      email: email.trim(),
      password,
    });

    if (result) {
      setIsSuccess(true);
      showSuccessToast("Registrasi akun berhasil. Silakan verifikasi email Anda.");
    } else {
      showErrorToast("Registrasi gagal. Periksa kembali data yang dimasukkan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          REGISTRASI PORTAL
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Buat Akun Administrator
        </h2>
        <p className="text-sm text-slate-500">
          Daftarkan identitas administrator untuk mengelola direktori lisensi.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          Akun berhasil didaftarkan. Silakan lanjutkan ke halaman login atau verifikasi email.
        </div>
      )}

      <div className="space-y-4">
        <AuthTextField
          label="Nama Lengkap Administrator"
          placeholder="Nama lengkap administrator"
          leftIcon={User}
          value={name}
          onChange={handleNameChange}
        />

        <AuthTextField
          label="Alamat Email"
          type="email"
          placeholder="admin@aksaventra.com"
          leftIcon={Mail}
          value={email}
          onChange={handleEmailChange}
        />

        <AuthTextField
          label="Kata Sandi"
          type="password"
          placeholder="Minimal 8 karakter huruf & angka"
          leftIcon={KeyRound}
          enablePasswordToggle
          minLengthValue={8}
          value={password}
          onChange={handlePasswordChange}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <AuthCheckbox
          label="Setuju Ketentuan Layanan SLA"
          checked={acceptedTerms}
          onChange={handleAcceptedTermsChange}
        />

        <Button
          variant="text"
          color="secondary"
          size="sm"
          onClick={handleOpenTermsModal}
          className="!px-0 !py-0 text-xs font-bold !text-indigo-600 hover:!bg-transparent"
        >
          Baca Syarat &amp; Ketentuan
        </Button>
      </div>

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
        Daftarkan Akun Administrator
      </Button>

      <div className="flex items-center justify-center gap-1 pt-1 text-xs text-slate-500">
        <span>Sudah memiliki akun?</span>
        <LinkButton
          href="/login"
          variant="text"
          color="secondary"
          size="sm"
          className="!px-1 !py-0 text-xs font-bold !text-indigo-600 hover:!bg-transparent"
        >
          Masuk Sekarang
        </LinkButton>
      </div>

      <TermsConditionsModal
        open={termsModalOpen}
        onClose={handleCloseTermsModal}
        onAccept={handleAcceptTermsModal}
      />
    </div>
  );
}
