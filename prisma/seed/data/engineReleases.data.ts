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
    mandatory: true,
    downloadUrl:
      "https://github.com/cybertank378/aksaventra-releases/releases/download/v2.2.3/aksaventra-portable-v2.2.3-windows-x64.zip",
    checksumSha256: "4a71c2041d7f5980dbe47c24ec62c5db8c936a931881f1d9177e79a554861bb6",
    fileSize: BigInt(302235348),
    releaseNotes:
      "Distribusi paket lengkap Aksaventra Portable Engine v2.2.3 (LMS Portable 64-bit) dengan portabilitas penuh dan tanpa penguncian HWID.",
    isActive: true,
    downloadCount: 0,
    publishedAt: new Date("2026-10-31T08:00:00Z"),
  },
];
