"use client";

import { CheckCircle2, Clock, ShieldAlert, ShieldCheck, Terminal, XCircle } from "lucide-react";
import { useState } from "react";
import type { VerifyChecksumRequestDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type { VerifyChecksumResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type {
  SimulationPayload,
  SimulationResponse,
} from "@/modules/engine-validation/presentation/hooks/useEngineMonitorApi";
import ChecksumMatchBadge from "@/sections/engine-validation/atomic/ChecksumMatchBadge";
import Button from "@/shared-ui/component/Button";
import { Modal } from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

interface EngineValidationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateValidate: (payload: SimulationPayload) => Promise<SimulationResponse>;
  onVerifyChecksum: (
    payload: VerifyChecksumRequestDTO,
  ) => Promise<VerifyChecksumResponseDTO | null>;
}

export default function EngineValidationSimulatorModal({
  isOpen,
  onClose,
  onSimulateValidate,
  onVerifyChecksum,
}: EngineValidationSimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<"KEY_VALIDATION" | "CHECKSUM_INTEGRITY">(
    "KEY_VALIDATION",
  );

  // Tab 1: Key Validation state
  const [serialKey, setSerialKey] = useState("AKSA-ENTERPRISE-2026-9F2A");
  const [hwid, setHwid] = useState("HWID-WIN11-AX98-7712");
  const [engineVersion, setEngineVersion] = useState("v2.2.2");
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyResult, setKeyResult] = useState<SimulationResponse | null>(null);

  // Tab 2: Checksum Verification state
  const [checksumVersion, setChecksumVersion] = useState("v2.2.2");
  const [sha256Hash, setSha256Hash] = useState(
    "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  );
  const [checksumLoading, setChecksumLoading] = useState(false);
  const [checksumResult, setChecksumResult] = useState<VerifyChecksumResponseDTO | null>(null);

  const handleRunKeyValidation = async () => {
    setKeyLoading(true);
    setKeyResult(null);
    try {
      const res = await onSimulateValidate({
        serial_key: serialKey,
        hwid,
        engine_version: engineVersion,
      });
      setKeyResult(res);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleRunChecksumVerify = async () => {
    setChecksumLoading(true);
    setChecksumResult(null);
    try {
      const res = await onVerifyChecksum({
        version: checksumVersion,
        sha256Hash,
      });
      setChecksumResult(res);
    } finally {
      setChecksumLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5 p-6">
        {/* Header Modal */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Terminal size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Simulator & Uji Diagnostik Engine</h3>
            <p className="text-xs text-slate-500">
              Pengujian langsung otentikasi kunci HWID dan kepatuhan SHA-256 (Isu #39)
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("KEY_VALIDATION")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === "KEY_VALIDATION"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck size={16} />
            Uji Validasi Serial Key & HWID
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CHECKSUM_INTEGRITY")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition-colors ${
              activeTab === "CHECKSUM_INTEGRITY"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert size={16} />
            Verifikasi Checksum SHA-256 (#39)
          </button>
        </div>

        {/* Tab 1: Key Validation */}
        {activeTab === "KEY_VALIDATION" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                label="Serial Key"
                value={serialKey}
                onChange={(e) => setSerialKey(e.target.value)}
                placeholder="AKSA-XXXX-XXXX-XXXX"
              />
              <TextField
                label="Hardware ID (HWID)"
                value={hwid}
                onChange={(e) => setHwid(e.target.value)}
                placeholder="HWID-WIN11-..."
              />
              <TextField
                label="Versi Engine"
                value={engineVersion}
                onChange={(e) => setEngineVersion(e.target.value)}
                placeholder="v2.2.2"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="filled"
                color="primary"
                loading={keyLoading}
                onClick={handleRunKeyValidation}
              >
                Kirim Permintaan Validasi
              </Button>
            </div>

            {/* Hasil Uji Validasi */}
            {keyResult && (
              <div
                className={`rounded-xl border p-4 text-xs ${
                  keyResult.valid
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    {keyResult.valid ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <span className="font-bold text-slate-900">
                      {keyResult.valid ? "Validasi Diterima (200 OK)" : "Validasi Gagal / Ditolak"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock size={14} />
                    <span>Latensi: {keyResult.latencyMs} ms</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-semibold text-slate-700">Pesan Sistem:</p>
                  <p className="mt-0.5 text-slate-600">{keyResult.message}</p>
                </div>

                {Boolean(keyResult.data) && (
                  <div className="mt-3">
                    <p className="font-semibold text-slate-700 mb-1">Payload Respon JSON:</p>
                    <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
                      {JSON.stringify(keyResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Checksum Verification */}
        {activeTab === "CHECKSUM_INTEGRITY" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <TextField
                label="Versi Biner Engine"
                value={checksumVersion}
                onChange={(e) => setChecksumVersion(e.target.value)}
                placeholder="v2.2.2"
              />
              <TextField
                label="Nilai SHA-256 Checksum (64 Karakter Heksadesimal)"
                value={sha256Hash}
                onChange={(e) => setSha256Hash(e.target.value)}
                placeholder="4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="filled"
                color="primary"
                loading={checksumLoading}
                onClick={handleRunChecksumVerify}
              >
                Cocokkan dengan Registri Biner
              </Button>
            </div>

            {/* Hasil Verifikasi Hash */}
            {checksumResult && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Status Integritas Biner:</span>
                  <ChecksumMatchBadge outcome={checksumResult.outcome} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Versi Diuji:</span>{" "}
                    {checksumResult.version}{" "}
                    {checksumResult.channel && `(${checksumResult.channel})`}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Status Kepercayaan:</span>{" "}
                    <span
                      className={`font-bold ${
                        checksumResult.isTrusted ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {checksumResult.isTrusted ? "Terpercaya (Aman)" : "Tidak Dipercaya"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="font-semibold text-slate-800">Checksum Resmi pada Basis Data:</p>
                  <p className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 break-all select-all">
                    {checksumResult.expectedHash ?? "Tidak terdaftar"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Modal */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button variant="outline" color="secondary" onClick={onClose}>
            Tutup Simulator
          </Button>
        </div>
      </div>
    </Modal>
  );
}
