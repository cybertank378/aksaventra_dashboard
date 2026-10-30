/**
 * Indonesian localization formatters for Charts & Metrics
 */

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  }
  return value.toLocaleString("id-ID");
}

export function formatPercentage(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatInteger(value: number): string {
  return value.toLocaleString("id-ID");
}

export function formatDisplayDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return isoString;
  }
}
