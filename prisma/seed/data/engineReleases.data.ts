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
    version: "v2.2.3",
    channel: "STABLE",
    minSupportedVersion: "v2.0.0",
    mandatory: false,
    downloadUrl: "/api/v1/updater/download/aksaventra_engine.exe?channel=stable",
    checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    fileSize: BigInt(13841200),
    releaseNotes:
      "Pembaruan penanganan lisensi portable otomatis dan optimasi performa Rust engine.",
    isActive: true,
    downloadCount: 154,
    publishedAt: new Date("2026-10-31T08:00:00Z"),
  },
];
