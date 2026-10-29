import type { ReleaseChannel } from "@prisma/client";

export interface EngineReleaseSeedItem {
  version: string;
  channel: ReleaseChannel;
  minSupportedVersion?: string;
  mandatory: boolean;
  downloadUrl: string;
  checksumSha256: string;
  fileSize: bigint;
  releaseNotes: string;
  isActive: boolean;
  downloadCount: number;
  publishedAt: Date;
}

export const INITIAL_ENGINE_RELEASES: EngineReleaseSeedItem[] = [
  {
    version: "v2.2.2",
    channel: "STABLE",
    minSupportedVersion: "v2.0.0",
    mandatory: false,
    downloadUrl: "/api/v1/updater/download/aksaventra_engine.exe?channel=stable",
    checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    fileSize: BigInt(13841200),
    releaseNotes:
      "Pembaruan penanganan lisensi otomatis, perbaikan handshake HWID, dan optimasi performa Rust engine.",
    isActive: true,
    downloadCount: 154,
    publishedAt: new Date("2026-10-25T08:00:00Z"),
  },
  {
    version: "v2.2.1",
    channel: "STABLE",
    minSupportedVersion: "v2.0.0",
    mandatory: false,
    downloadUrl: "/api/v1/updater/download/aksaventra_engine.exe?channel=stable",
    checksumSha256: "9a21b34e56c7d890123456789abcdef0123456789abcdef0123456789abcdef0",
    fileSize: BigInt(13720500),
    releaseNotes: "Integrasi awal modul auto-updater dan perbaikan vault secret decryption.",
    isActive: false,
    downloadCount: 890,
    publishedAt: new Date("2026-09-15T10:00:00Z"),
  },
  {
    version: "v2.3.0-beta.1",
    channel: "BETA",
    minSupportedVersion: "v2.2.0",
    mandatory: false,
    downloadUrl: "/api/v1/updater/download/aksaventra_engine.exe?channel=beta",
    checksumSha256: "cba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fed",
    fileSize: BigInt(14120000),
    releaseNotes: "Versi pratinjau engine v2.3 dengan dukungan multi-session headless testing.",
    isActive: true,
    downloadCount: 38,
    publishedAt: new Date("2026-10-28T14:30:00Z"),
  },
];
