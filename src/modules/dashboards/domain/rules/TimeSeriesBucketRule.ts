import type { ChartGranularity } from "@/modules/dashboards/domain/types/ChartGranularity";
import { TimeSeriesPoint } from "@/modules/dashboards/domain/value-object/TimeSeriesPoint";
import { DASHBOARD_TIMEZONE } from "@/modules/dashboards/shared/constants/dashboardConstants";

export interface RawBucketRecord {
  bucket: string;
  value: number;
}

export class TimeSeriesBucketRule {
  /**
   * Generates continuous buckets from startDate to endDate and merges with existing counts.
   */
  public static fillBuckets(
    startDate: Date,
    endDate: Date,
    granularity: ChartGranularity,
    records: readonly RawBucketRecord[],
    timezone: string = DASHBOARD_TIMEZONE,
  ): TimeSeriesPoint[] {
    const recordMap = new Map<string, number>();
    for (const r of records) {
      recordMap.set(r.bucket, (recordMap.get(r.bucket) ?? 0) + r.value);
    }

    const points: TimeSeriesPoint[] = [];

    if (granularity === "day") {
      const current = new Date(startDate.getTime());
      const endMs = endDate.getTime();

      // Ensure day-by-day iteration
      while (current.getTime() <= endMs) {
        const bucket = TimeSeriesBucketRule.formatDayBucket(current, timezone);
        const label = TimeSeriesBucketRule.formatDayLabel(current, timezone);
        const value = recordMap.get(bucket) ?? 0;

        points.push(new TimeSeriesPoint({ bucket, label, value }));

        // Advance 1 day
        current.setDate(current.getDate() + 1);
      }
    } else if (granularity === "week") {
      const current = new Date(startDate.getTime());
      const endMs = endDate.getTime();

      while (current.getTime() <= endMs) {
        const bucket = TimeSeriesBucketRule.formatDayBucket(current, timezone);
        const label = TimeSeriesBucketRule.formatDayLabel(current, timezone);
        const value = recordMap.get(bucket) ?? 0;

        points.push(new TimeSeriesPoint({ bucket, label, value }));

        // Advance 7 days
        current.setDate(current.getDate() + 7);
      }
    } else if (granularity === "month") {
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();

      while (
        current.getFullYear() < endYear ||
        (current.getFullYear() === endYear && current.getMonth() <= endMonth)
      ) {
        const bucket = TimeSeriesBucketRule.formatMonthBucket(current);
        const label = TimeSeriesBucketRule.formatMonthLabel(current, timezone);
        const value = recordMap.get(bucket) ?? 0;

        points.push(new TimeSeriesPoint({ bucket, label, value }));

        current.setMonth(current.getMonth() + 1);
      }
    }

    return points;
  }

  public static formatDayBucket(date: Date, timezone: string = DASHBOARD_TIMEZONE): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    return parts; // YYYY-MM-DD
  }

  public static formatDayLabel(date: Date, timezone: string = DASHBOARD_TIMEZONE): string {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: timezone,
      day: "numeric",
      month: "short",
    }).format(date);
  }

  public static formatMonthBucket(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  public static formatMonthLabel(date: Date, timezone: string = DASHBOARD_TIMEZONE): string {
    const formatted = new Intl.DateTimeFormat("id-ID", {
      timeZone: timezone,
      month: "short",
      year: "numeric",
    }).format(date);
    return formatted.replace(".", "");
  }
}
