import type { BadgeColor } from "@/shared-ui/component/Badge";

export function formatRelativeTime(dateString: string): { relative: string; time: string } {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;

  if (diffSec < 5) {
    return { relative: "Baru saja", time };
  }
  if (diffSec < 60) {
    return { relative: `${diffSec} dtk lalu`, time };
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return { relative: `${diffMin} mnt lalu`, time };
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return { relative: `${diffHours} jam lalu`, time };
  }

  return { relative: date.toLocaleDateString("id-ID"), time };
}

export function formatLatency(latencyMs: number | null | undefined): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (typeof latencyMs !== "number" || latencyMs < 0) {
    return { label: "- ms", tone: "neutral" as unknown as "warning" };
  }

  if (latencyMs < 100) {
    return { label: `⚡ ${latencyMs} ms`, tone: "success" };
  }
  if (latencyMs < 200) {
    return { label: `⏱ ${latencyMs} ms`, tone: "warning" };
  }

  return { label: `⚠ ${latencyMs} ms`, tone: "danger" };
}

export function getValidationResultBadgeProps(
  result: string,
  statusCode: number,
): {
  label: string;
  color: BadgeColor;
} {
  if (result === "VERIFIED" && statusCode === 200) {
    return { label: "● Terverifikasi 200", color: "success" };
  }
  if (result === "ACTIVATED" && statusCode === 200) {
    return { label: "★ Aktivasi Baru 200", color: "info" };
  }
  if (result === "HWID_MISMATCH" || statusCode === 403) {
    return { label: "▲ HWID Mismatch 403", color: "warning" };
  }
  if (result === "EXPIRED") {
    return { label: "✕ Lisensi Expired 401", color: "error" };
  }
  if (result === "SUSPENDED" || result === "REVOKED") {
    return { label: "✕ Dicabut / Suspended", color: "error" };
  }
  if (result === "NOT_FOUND" || statusCode === 404) {
    return { label: "✕ Key Tidak Ditemukan", color: "error" };
  }

  return { label: `${result} (${statusCode})`, color: "secondary" };
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}
