"use client";

import clsx from "clsx";
import {
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Globe,
  Headphones,
  Server,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { AuthTelemetryResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import { useAuthApi } from "@/modules/auth/presentation/hooks/useAuthApi";
import type { AuthModalTopic } from "@/sections/auth/atoms/terms";
import AuthTelemetryCard from "@/sections/auth/molecules/AuthTelemetryCard";
import TermsConditionsModal from "@/sections/auth/molecules/TermsConditionsModal";
import ChangePasswordForm from "@/sections/auth/organisms/ChangePasswordForm";
import ForgetPasswordForm from "@/sections/auth/organisms/ForgetPasswordForm";
import LoginForm from "@/sections/auth/organisms/LoginForm";
import RegisterForm from "@/sections/auth/organisms/RegisterForm";
import ResetPasswordForm from "@/sections/auth/organisms/ResetPasswordForm";
import VerifyEmailForm from "@/sections/auth/organisms/VerifyEmailForm";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";

export type AuthViewMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "change-password"
  | "verify-email";

export interface AuthPageProps {
  mode?: AuthViewMode;
  token?: string;
  redirectTo?: string;
}

interface AuthFormContentProps {
  mode: AuthViewMode;
  token: string;
  redirectTo: string;
}

function AuthFormContent({ mode, token, redirectTo }: AuthFormContentProps) {
  switch (mode) {
    case "register":
      return <RegisterForm />;
    case "forgot-password":
      return <ForgetPasswordForm />;
    case "reset-password":
      return <ResetPasswordForm initialToken={token} />;
    case "change-password":
      return <ChangePasswordForm />;
    case "verify-email":
      return <VerifyEmailForm initialToken={token} />;
    default:
      return <LoginForm redirectTo={redirectTo} />;
  }
}

function RecoveryAuthLayout({ mode, token, redirectTo }: AuthFormContentProps) {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<AuthModalTopic>("support");

  const activeRecoveryStep = mode === "forgot-password" ? 1 : mode === "verify-email" ? 2 : 3;

  const handleContactSecOps = () => {
    setModalTopic("support");
    setSupportModalOpen(true);
  };

  const handleCloseSupportModal = () => {
    setSupportModalOpen(false);
  };

  const handleChangeSupportTopic = (nextTopic: AuthModalTopic) => {
    setModalTopic(nextTopic);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900">
      {/* TOP RECOVERY HEADER BAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs">
            <Image
              src="/assets/images/logo/logo.png"
              alt="Aksaventra Logo"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
              className="max-h-8 max-w-8 object-contain"
              priority
            />
          </div>

          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Aksa<span className="text-indigo-600">ventra</span>
          </span>

          <Badge
            color="warning"
            variant="soft"
            className="hidden rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 sm:inline-flex"
          >
            Pusat Pemulihan Akses
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-slate-500 sm:inline">
            Butuh bantuan langsung?
          </span>

          <Button
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={Headphones}
            onClick={handleContactSecOps}
            className="!rounded-xl !border-indigo-200 !bg-indigo-50/70 px-3.5 py-1.5 text-xs font-semibold !text-indigo-600 hover:!bg-indigo-100"
          >
            Hubungi Tim SecOps
          </Button>
        </div>
      </header>

      {/* MAIN CENTERED STEPPER + CARD */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[540px] space-y-6">
          {/* 3-STEP PROGRESS STEPPER */}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs sm:justify-between">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  activeRecoveryStep === 1
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                1
              </span>
              <span
                className={clsx(
                  "text-xs font-bold",
                  activeRecoveryStep === 1 ? "text-indigo-600" : "text-slate-500",
                )}
              >
                Verifikasi Email
              </span>
            </div>

            <ChevronRight size={14} className="hidden text-slate-300 sm:inline" />

            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  activeRecoveryStep === 2
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                2
              </span>
              <span
                className={clsx(
                  "text-xs font-semibold",
                  activeRecoveryStep === 2 ? "text-indigo-600 font-bold" : "text-slate-400",
                )}
              >
                Validasi Tautan Token
              </span>
            </div>

            <ChevronRight size={14} className="hidden text-slate-300 sm:inline" />

            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  activeRecoveryStep === 3
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                3
              </span>
              <span
                className={clsx(
                  "text-xs font-semibold",
                  activeRecoveryStep === 3 ? "text-indigo-600 font-bold" : "text-slate-400",
                )}
              >
                Atur Kata Sandi Baru
              </span>
            </div>
          </div>

          {/* RECOVERY FORM CARD */}
          <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
            <AuthFormContent mode={mode} token={token} redirectTo={redirectTo} />
          </Card>
        </div>
      </div>

      {/* BOTTOM RECOVERY TELEMETRY FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-8 lg:px-12">
        <p>Proteksi Keamanan: SHA-256 Token Verification • Rate Limiting Aktif</p>
        <p>
          ID Sesi Pemulihan:{" "}
          <span className="font-mono font-bold text-slate-700">REC-2026-88412-ID</span>
        </p>
      </footer>

      <TermsConditionsModal
        open={supportModalOpen}
        onClose={handleCloseSupportModal}
        topic={modalTopic}
        onTopicChange={handleChangeSupportTopic}
      />
    </div>
  );
}

function SplitEnterpriseAuthLayout({ mode, token, redirectTo }: AuthFormContentProps) {
  const { getTelemetry } = useAuthApi();
  const [termsOpen, setTermsOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<AuthModalTopic>("sla");
  const [telemetry, setTelemetry] = useState<AuthTelemetryResponseDTO | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTelemetry = async () => {
      setTelemetryLoading(true);
      const data = await getTelemetry();
      if (active) {
        setTelemetry(data);
        setTelemetryLoading(false);
      }
    };

    fetchTelemetry();

    return () => {
      active = false;
    };
  }, [getTelemetry]);

  const handleOpenPrivacyModal = () => {
    setModalTopic("privacy");
    setTermsOpen(true);
  };

  const handleOpenSlaModal = () => {
    setModalTopic("sla");
    setTermsOpen(true);
  };

  const handleOpenApiDocsModal = () => {
    setModalTopic("api-docs");
    setTermsOpen(true);
  };

  const handleOpenSupportModal = () => {
    setModalTopic("support");
    setTermsOpen(true);
  };

  const handleTopicChange = (nextTopic: AuthModalTopic) => {
    setModalTopic(nextTopic);
  };

  const handleCloseTerms = () => {
    setTermsOpen(false);
  };

  const isServerOnline = telemetry?.online === true;

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* TOP ENTERPRISE HEADER BAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs">
            <Image
              src="/assets/images/logo/logo.png"
              alt="Aksaventra Logo"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
              className="max-h-8 max-w-8 object-contain"
              priority
            />
          </div>

          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Aksa<span className="text-indigo-600">ventra</span>
          </span>

          <Badge
            color="secondary"
            variant="soft"
            className="hidden rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:inline-flex"
          >
            Enterprise Portal v3.4
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={clsx(
              "hidden items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold md:inline-flex",
              isServerOnline
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
                : "border-amber-200 bg-amber-50/90 text-amber-700",
            )}
          >
            <span
              className={clsx(
                "h-2 w-2 rounded-full",
                isServerOnline ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <span>
              {telemetryLoading
                ? "Memeriksa Status Server..."
                : isServerOnline
                  ? `Server Aksaventra: Operasional (${telemetry.latencyMs} ms)`
                  : "Database Server: Belum Tersambung"}
            </span>
          </div>

          <span className="hidden text-slate-300 md:inline">|</span>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Globe size={15} className="text-slate-500" />
            <span>Bahasa Indonesia</span>
          </div>
        </div>
      </header>

      {/* MAIN SPLIT-SCREEN CONTENT (1280px REFERENCE GRID) */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL: AKSAVENTRA ENTERPRISE TELEMETRY & HERO */}
        <div className="flex flex-col justify-between border-b border-slate-200 bg-gradient-to-br from-indigo-50/50 via-slate-50/60 to-white px-6 py-10 sm:px-12 lg:col-span-6 lg:border-b-0 lg:border-r lg:px-16 lg:py-14">
          <div className="mx-auto w-full max-w-[540px] space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-600">
              <Shield size={14} className="text-indigo-600" />
              <span className="underline decoration-indigo-300 underline-offset-2">
                Sistem Manajemen Lisensi Terpusat
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold leading-[1.18] tracking-tight text-slate-900 sm:text-4xl">
                Kendalikan Distribusi Kunci Lisensi &amp; Kuota Perangkat Secara Real-Time.
              </h1>

              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Platform manajemen lisensi tingkat enterprise dengan validasi kriptografi SHA-256,
                pemantauan perangkat otomatis, dan proteksi Hardware-ID.
              </p>
            </div>

            <AuthTelemetryCard telemetry={telemetry} loading={telemetryLoading} />
          </div>

          <div className="mx-auto mt-10 w-full max-w-[540px] border-t border-slate-200/80 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>ISO/IEC 27001 Certified</span>
              </div>

              <div className="flex items-center gap-2">
                <Fingerprint size={16} className="text-indigo-600" />
                <span>Argon2id + JWT Session</span>
              </div>

              <div className="flex items-center gap-2">
                <Server size={16} className="text-cyan-600" />
                <span>Multi-Node HA</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AUTHENTICATION FORM */}
        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:col-span-6 lg:px-16 lg:py-14">
          <div className="w-full max-w-[430px]">
            <AuthFormContent mode={mode} token={token} redirectTo={redirectTo} />
          </div>
        </div>
      </div>

      {/* BOTTOM ENTERPRISE FOOTER BAR */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-8 lg:px-12">
        <p>© 2026 PT Aksaventra Teknologi Nusantara. Seluruh hak cipta dilindungi undang-undang.</p>

        <div className="flex flex-wrap items-center gap-5">
          <Button
            variant="text"
            color="secondary"
            size="sm"
            onClick={handleOpenPrivacyModal}
            className="!px-0 !py-0 text-xs font-medium !text-slate-600 hover:!bg-transparent hover:!text-indigo-600"
          >
            Kebijakan Privasi
          </Button>
          <Button
            variant="text"
            color="secondary"
            size="sm"
            onClick={handleOpenSlaModal}
            className="!px-0 !py-0 text-xs font-medium !text-slate-600 hover:!bg-transparent hover:!text-indigo-600"
          >
            Ketentuan Layanan SLA
          </Button>
          <Button
            variant="text"
            color="secondary"
            size="sm"
            onClick={handleOpenApiDocsModal}
            className="!px-0 !py-0 text-xs font-medium !text-slate-600 hover:!bg-transparent hover:!text-indigo-600"
          >
            Dokumentasi API
          </Button>
          <Button
            variant="text"
            color="secondary"
            size="sm"
            onClick={handleOpenSupportModal}
            className="!px-0 !py-0 text-xs font-medium !text-slate-600 hover:!bg-transparent hover:!text-indigo-600"
          >
            Bantuan Darurat IT
          </Button>
        </div>
      </footer>

      <TermsConditionsModal
        open={termsOpen}
        onClose={handleCloseTerms}
        topic={modalTopic}
        onTopicChange={handleTopicChange}
      />
    </div>
  );
}

function PasswordUpdateAuthLayout({ mode, token, redirectTo }: AuthFormContentProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900">
      {/* TOP PASSWORD UPDATE HEADER BAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs">
            <Image
              src="/assets/images/logo/logo.png"
              alt="Aksaventra Logo"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
              className="max-h-8 max-w-8 object-contain"
              priority
            />
          </div>

          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Aksa<span className="text-indigo-600">ventra</span>
          </span>

          <Badge
            color="success"
            variant="soft"
            className="hidden rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex"
          >
            Token Pemulihan Terverifikasi
          </Badge>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
          <User size={14} className="text-indigo-600" />
          <span>admin@aksaventra.com</span>
        </div>
      </header>

      {/* MAIN CENTERED 2-COLUMN CARD */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <Card className="w-full max-w-[920px] overflow-hidden rounded-3xl border border-slate-200/90 bg-white !p-0 shadow-sm">
          <AuthFormContent mode={mode} token={token} redirectTo={redirectTo} />
        </Card>
      </div>

      {/* BOTTOM PASSWORD POLICY FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-8 lg:px-12">
        <p>Kebijakan Rotasi Sandi: Wajib diperbarui setiap 90 hari</p>
        <p>
          Status Enkripsi Brankas:{" "}
          <span className="font-bold text-emerald-600">Argon2id + AES-256-GCM Aktif</span>
        </p>
      </footer>
    </div>
  );
}

export default function AuthPage({
  mode = "login",
  token = "",
  redirectTo = "/dashboard",
}: AuthPageProps) {
  if (mode === "reset-password" || mode === "change-password") {
    return <PasswordUpdateAuthLayout mode={mode} token={token} redirectTo={redirectTo} />;
  }

  if (mode === "forgot-password" || mode === "verify-email") {
    return <RecoveryAuthLayout mode={mode} token={token} redirectTo={redirectTo} />;
  }

  return <SplitEnterpriseAuthLayout mode={mode} token={token} redirectTo={redirectTo} />;
}
