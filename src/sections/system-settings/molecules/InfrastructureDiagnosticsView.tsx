"use client";

import { Clock, Database, Gauge, HardDrive, KeyRound, Mail, ShieldCheck } from "lucide-react";
import type { SystemDiagnosticsDTO } from "@/modules/settings/domain/dto/SystemSettingsResponseDTO";
import Card from "@/shared-ui/component/Card";
import { DiagnosticStatusItem } from "../atomic/DiagnosticStatusItem";

interface InfrastructureDiagnosticsViewProps {
  diagnostics: SystemDiagnosticsDTO | null;
}

export function InfrastructureDiagnosticsView({ diagnostics }: InfrastructureDiagnosticsViewProps) {
  if (!diagnostics) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        Memuat status diagnostik infrastruktur...
      </div>
    );
  }

  const isStorageS3 = diagnostics.storageDriver === "s3";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Diagnostik Kesiapan Infrastruktur & Lingkungan (Read-Only)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Status kesehatan komponen inti sistem, konektivitas database, dan perlindungan kunci
          kriptografi. Seluruh informasi dirahasiakan tanpa membocorkan kredensial mentah.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STORAGE DRIVER */}
          <DiagnosticStatusItem
            title="Driver Penyimpanan Biner (Storage Driver)"
            subtitle={
              isStorageS3
                ? "Amazon S3 Object Storage (Cloud Bucket Terkonfigurasi)"
                : "Local File System Storage (/public/uploads)"
            }
            statusLabel={isStorageS3 ? "S3 READY" : "LOCAL READY"}
            badgeVariant="primary"
            icon={HardDrive}
          />

          {/* POSTGRESQL DATABASE */}
          <DiagnosticStatusItem
            title="Konektivitas Basis Data PostgreSQL"
            subtitle="Prisma ORM via @prisma/adapter-pg (Pool Max: 10, Timeout: 5s)"
            statusLabel={diagnostics.databaseConnected ? "CONNECTED" : "DISCONNECTED"}
            badgeVariant={diagnostics.databaseConnected ? "success" : "error"}
            icon={Database}
          />

          {/* VAULT MASTER SECRET */}
          <DiagnosticStatusItem
            title="Kunci Enkripsi Master Vault (AES-256)"
            subtitle="VAULT_MASTER_SECRET untuk dekripsi payload rahasia klien engine"
            statusLabel={
              diagnostics.vaultSecretConfigured
                ? "TERPASANG (VALID 256-BIT)"
                : "BELUM DIKONFIGURASI"
            }
            badgeVariant={diagnostics.vaultSecretConfigured ? "success" : "error"}
            icon={KeyRound}
          />

          {/* SMTP SERVICE */}
          <DiagnosticStatusItem
            title="Layanan Notifikasi Email (SMTP)"
            subtitle="Pengiriman email verifikasi dan peringatan kedaluwarsa lisensi"
            statusLabel={diagnostics.smtpConfigured ? "CONFIGURED" : "NOT CONFIGURED"}
            badgeVariant={diagnostics.smtpConfigured ? "info" : "warning"}
            icon={Mail}
          />

          {/* SLA TARGET LATENCY */}
          <DiagnosticStatusItem
            title="Target SLA Latensi API Validasi"
            subtitle="Ambang batas toleransi latensi per request validasi biner klien"
            statusLabel={`< ${diagnostics.targetSlaLatencyMs} ms`}
            badgeVariant="success"
            icon={Gauge}
          />

          {/* APP TIMEZONE */}
          <DiagnosticStatusItem
            title="Zona Waktu Server Aplikasi"
            subtitle="Sinkronisasi timestamp audit log dan telemetri validasi engine"
            statusLabel={diagnostics.appTimezone}
            badgeVariant="secondary"
            icon={Clock}
          />
        </div>
      </div>

      <Card className="p-4 bg-emerald-50/60 border-emerald-200/70">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-emerald-900">
              Prinsip Perlindungan Kredensial (Zero Secret Leakage)
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Modul diagnostik mematuhi standar keamanan CIS & OWASP. Seluruh nilai konfigurasi
              sensitif (seperti DATABASE_URL, AWS_SECRET_ACCESS_KEY, dan VAULT_MASTER_SECRET) tidak
              pernah diteruskan ke peramban web dan hanya diverifikasi status validitas
              fungsionalnya.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
