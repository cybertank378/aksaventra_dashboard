import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";

export class DateRange {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    if (startDate.getTime() >= endDate.getTime()) {
      throw new Error("Start date must be strictly before end date.");
    }
    this._startDate = new Date(startDate.getTime());
    this._endDate = new Date(endDate.getTime());
  }

  get startDate(): Date {
    return new Date(this._startDate.getTime());
  }

  get endDate(): Date {
    return new Date(this._endDate.getTime());
  }

  get durationMs(): number {
    return this._endDate.getTime() - this._startDate.getTime();
  }

  get durationDays(): number {
    return Math.ceil(this.durationMs / (24 * 60 * 60 * 1000));
  }

  public static fromChartRange(range: ChartRange, now: Date = new Date()): DateRange {
    const end = new Date(now.getTime());
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return new DateRange(start, end);
  }

  public static lastNMonths(months: number, now: Date = new Date()): DateRange {
    if (months <= 0) {
      throw new Error("Months must be greater than zero.");
    }
    const end = new Date(now.getTime());
    const start = new Date(now.getTime());
    start.setMonth(start.getMonth() - months);
    return new DateRange(start, end);
  }

  public static nextNMonths(months: number, now: Date = new Date()): DateRange {
    if (months <= 0) {
      throw new Error("Months must be greater than zero.");
    }
    const start = new Date(now.getTime());
    const end = new Date(now.getTime());
    end.setMonth(end.getMonth() + months);
    return new DateRange(start, end);
  }
}
