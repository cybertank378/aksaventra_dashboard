"use client";

import {
  CheckCircle2,
  Clock,
  Code2,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { VerifyChecksumRequestDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type { VerifyChecksumResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type {
  SimulationPayload,
  SimulationResponse,
} from "@/modules/engine-validation/presentation/hooks/useEngineMonitorApi";
import ChecksumMatchBadge from "@/sections/engine-validation/atomic/ChecksumMatchBadge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import { Modal } from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

export interface SimulatorInitialValues {
  tab?: "KEY_VALIDATION" | "CHECKSUM_INTEGRITY";
  serialKey?: string;
  hwid?: string;
  engineVersion?: string;
  checksumVersion?: string;
  sha256Hash?: string;
}

interface EngineValidationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: SimulatorInitialValues | null;
  onSimulateValidate: (payload: SimulationPayload) => Promise<SimulationResponse>;
  onVerifyChecksum: (
    payload: VerifyChecksumRequestDTO,
  ) => Promise<VerifyChecksumResponseDTO | null>;
}

export default function EngineValidationSimulatorModal({
  isOpen,
  onClose,
  initialValues,
  onSimulateValidate,
  onVerifyChecksum,
}: EngineValidationSimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<"KEY_VALIDATION" | "CHECKSUM_INTEGRITY">(
    initialValues?.tab ?? "KEY_VALIDATION",
  );

  // Tab 1: Key Validation state (tanpa nilai hardcode dummy)
  const [serialKey, setSerialKey] = useState(initialValues?.serialKey ?? "");
  const [hwid, setHwid] = useState(initialValues?.hwid ?? "");
  const [engineVersion, setEngineVersion] = useState(initialValues?.engineVersion ?? "");
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyResult, setKeyResult] = useState<SimulationResponse | null>(null);

  // Tab 2: Checksum Verification state (tanpa nilai hardcode dummy)
  const [checksumVersion, setChecksumVersion] = useState(
    initialValues?.checksumVersion ?? initialValues?.engineVersion ?? "",
  );
  const [sha256Hash, setSha256Hash] = useState(initialValues?.sha256Hash ?? "");
  const [checksumLoading, setChecksumLoading] = useState(false);
  const [checksumResult, setChecksumResult] = useState<VerifyChecksumResponseDTO | null>(null);

  // Sinkronisasi setiap kali modal dibuka atau initialValues diperbarui
  useEffect(() => {
    if (isOpen) {
      if (initialValues?.tab) {
        setActiveTab(initialValues.tab);
      }
      setSerialKey(initialValues?.serialKey ?? "");
      setHwid(initialValues?.hwid ?? "");
      setEngineVersion(initialValues?.engineVersion ?? "");
      setChecksumVersion(initialValues?.checksumVersion ?? initialValues?.engineVersion ?? "");
      setSha256Hash(initialValues?.sha256Hash ?? "");
      setKeyResult(null);
      setChecksumResult(null);
    }
  }, [isOpen, initialValues]);

  const handleRunKeyValidation = async () => {
    if (!serialKey.trim() || !hwid.trim()) {
      return;
    }

    setKeyLoading(true);
    setKeyResult(null);
    try {
      const res = await onSimulateValidate({
        serial_key: serialKey.trim(),
        hwid: hwid.trim(),
        engine_version: engineVersion.trim(),
      });
      setKeyResult(res);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleResetKeyForm = () => {
    setSerialKey(initialValues?.serialKey ?? "");
    setHwid(initialValues?.hwid ?? "");
    setEngineVersion(initialValues?.engineVersion ?? "");
    setKeyResult(null);
  };

  const handleRunChecksumVerify = async () => {
    if (!checksumVersion.trim() || !sha256Hash.trim()) {
      return;
    }

    setChecksumLoading(true);
    setChecksumResult(null);
    try {
      const res = await onVerifyChecksum({
        version: checksumVersion.trim(),
        sha256Hash: sha256Hash.trim(),
      });
      setChecksumResult(res);
    } finally {
      setChecksumLoading(false);
    }
  };

  const handleResetChecksumForm = () => {
    setChecksumVersion(initialValues?.checksumVersion ?? initialValues?.engineVersion ?? "");
    setSha256Hash(initialValues?.sha256Hash ?? "");
    setChecksumResult(null);
  };

  const isKeySubmitDisabled = !serialKey.trim() || !hwid.trim() || keyLoading;
  const isChecksumSubmitDisabled = !checksumVersion.trim() || !sha256Hash.trim() || checksumLoading;

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6 p-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Simulator &amp; Uji Diagnostik Engine
              </h3>
              <p className="text-xs text-slate-500">
                Pengujian langsung otentikasi kunci HWID dan kepatuhan SHA-256 (Isu #39)
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeTab === "KEY_VALIDATION" ? "filled" : "outline"}
              color={activeTab === "KEY_VALIDATION" ? "primary" : "secondary"}
              size="sm"
              leftIcon={ShieldCheck}
              onClick={() => setActiveTab("KEY_VALIDATION")}
            >
              Uji Validasi Key
            </Button>
            <Button
              type="button"
              variant={activeTab === "CHECKSUM_INTEGRITY" ? "filled" : "outline"}
              color={activeTab === "CHECKSUM_INTEGRITY" ? "primary" : "secondary"}
              size="sm"
              leftIcon={ShieldAlert}
              onClick={() => setActiveTab("CHECKSUM_INTEGRITY")}
            >
              Verifikasi Checksum (#39)
            </Button>
          </div>
        </div>

        {/* Tab 1: Key Validation (Horizontal Layout: Kiri Form, Kanan Output) */}
        {activeTab === "KEY_VALIDATION" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* SISI KIRI (5 Kolom): Form Input Parameter */}
            <div className="space-y-4 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-6">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">Parameter Pengujian Validasi</h4>
                <p className="text-xs text-slate-500">
                  Kirim payload diagnostik ke endpoint{" "}
                  <code className="font-mono text-slate-700 font-semibold">
                    /api/v1/validate-key
                  </code>
                </p>
              </div>

              <div className="space-y-3">
                <TextField
                  label="Serial Key *"
                  value={serialKey}
                  onChange={(e) => setSerialKey(e.target.value)}
                  placeholder="Masukkan serial key aktif lisensi..."
                />
                <TextField
                  label="Hardware ID (HWID) *"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                  placeholder="Masukkan nilai HWID perangkat..."
                />
                <TextField
                  label="Versi Engine Klien"
                  value={engineVersion}
                  onChange={(e) => setEngineVersion(e.target.value)}
                  placeholder="Contoh: v2.2.2 (opsional)"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  size="sm"
                  leftIcon={Play}
                  loading={keyLoading}
                  disabled={isKeySubmitDisabled}
                  onClick={handleRunKeyValidation}
                  fullWidth
                >
                  Jalankan Validasi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  leftIcon={RotateCcw}
                  onClick={handleResetKeyForm}
                  title="Bersihkan Input"
                >
                  Bersihkan
                </Button>
              </div>
            </div>

            {/* SISI KANAN (7 Kolom): Panel Hasil Diagnostik */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Hasil Telemetri &amp; Respon Server
                </h4>
                {keyResult && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock size={13} />
                    {keyResult.latencyMs} ms
                  </span>
                )}
              </div>

              {!keyResult && !keyLoading && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-slate-400">
                  <Terminal size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Belum ada pengujian yang dijalankan
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Masukkan Serial Key dan HWID di sebelah kiri lalu klik tombol "Jalankan
                    Validasi" untuk melihat respon diagnostik.
                  </p>
                </div>
              )}

              {keyLoading && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-10 text-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Menghubungi endpoint validasi engine...
                  </p>
                </div>
              )}

              {keyResult && (
                <div className="space-y-3">
                  <div
                    className={`rounded-xl border p-4 text-xs ${
                      keyResult.valid
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-red-200 bg-red-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        {keyResult.valid ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 text-sm">
                          {keyResult.valid ? "Validasi Diterima (200 OK)" : "Validasi Ditolak"}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        ⚡ {keyResult.latencyMs} ms
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <span className="font-semibold text-slate-700">Pesan Sistem:</span>
                      <p className="mt-0.5 text-slate-800 font-medium">{keyResult.message}</p>
                    </div>
                  </div>

                  {Boolean(keyResult.data) && (
                    <div className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-xs shadow-inner">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                          <Code2 size={13} />
                          Payload Respon JSON
                        </span>
                      </div>
                      <pre className="max-h-56 overflow-auto font-mono text-[11px] text-emerald-400 leading-relaxed select-all">
                        {JSON.stringify(keyResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Checksum Verification (Horizontal Layout: Kiri Form, Kanan Output) */}
        {activeTab === "CHECKSUM_INTEGRITY" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* SISI KIRI (5 Kolom): Form Input Parameter */}
            <div className="space-y-4 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-6">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Parameter Verifikasi Biner (#39)
                </h4>
                <p className="text-xs text-slate-500">
                  Uji kecocokan hash berkas terhadap registri resmi di basis data
                </p>
              </div>

              <div className="space-y-3">
                <TextField
                  label="Versi Biner Engine *"
                  value={checksumVersion}
                  onChange={(e) => setChecksumVersion(e.target.value)}
                  placeholder="Contoh: v2.2.2"
                />
                <TextField
                  label="Nilai Checksum SHA-256 (64 Karakter Heksadesimal) *"
                  value={sha256Hash}
                  onChange={(e) => setSha256Hash(e.target.value)}
                  placeholder="Masukkan 64 digit hex SHA-256..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  size="sm"
                  leftIcon={ShieldCheck}
                  loading={checksumLoading}
                  disabled={isChecksumSubmitDisabled}
                  onClick={handleRunChecksumVerify}
                  fullWidth
                >
                  Cocokkan Checksum
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  leftIcon={RotateCcw}
                  onClick={handleResetChecksumForm}
                  title="Bersihkan Input"
                >
                  Bersihkan
                </Button>
              </div>
            </div>

            {/* SISI KANAN (7 Kolom): Panel Hasil Verifikasi */}
            <div className="space-y-4 lg:col-span-7">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">Status Integritas Kriptografis</h4>
                <p className="text-xs text-slate-500">
                  Hasil evaluasi aturan integritas biner resmi aksaventra_engine.exe
                </p>
              </div>

              {!checksumResult && !checksumLoading && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-slate-400">
                  <ShieldAlert size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Belum ada verifikasi checksum
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Masukkan versi dan nilai hash SHA-256 di sebelah kiri lalu klik "Cocokkan
                    Checksum".
                  </p>
                </div>
              )}

              {checksumLoading && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-10 text-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Memeriksa keaslian hash terhadap registri resmi...
                  </p>
                </div>
              )}

              {checksumResult && (
                <Card className="p-4 space-y-4 bg-slate-50/80 border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">Status Integritas:</p>
                      <div className="mt-1">
                        <ChecksumMatchBadge outcome={checksumResult.outcome} />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Kepercayaan Biner:</p>
                      <span
                        className={`text-xs font-bold ${
                          checksumResult.isTrusted ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {checksumResult.isTrusted ? "● Terpercaya & Sah" : "✕ Tidak Terpercaya"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-white p-2.5 border border-slate-200/80">
                      <span className="text-slate-500 block">Versi Diuji:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {checksumResult.version}{" "}
                        {checksumResult.channel && `(${checksumResult.channel})`}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-slate-200/80">
                      <span className="text-slate-500 block">Waktu Verifikasi:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(checksumResult.checkedAt).toLocaleTimeString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-700">
                      Checksum Resmi pada Basis Data:
                    </span>
                    <p className="rounded-lg border border-slate-200 bg-white p-2 font-mono text-[11px] text-slate-700 break-all select-all">
                      {checksumResult.expectedHash ?? "Tidak terdaftar dalam registri"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Footer Modal */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" color="secondary" onClick={onClose}>
            Tutup Simulator
          </Button>
        </div>
      </div>
    </Modal>
  );
}
