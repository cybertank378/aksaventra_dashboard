export function formatTimestampWIB(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return isoDateString;
  }
}

export function truncateHash(hash: string | null | undefined, head = 8, tail = 6): string {
  if (!hash) return "-";
  if (hash.length <= head + tail) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function formatLatency(latencyMs: number | null | undefined): string {
  if (latencyMs === null || latencyMs === undefined) return "-";
  return `${latencyMs} ms`;
}
