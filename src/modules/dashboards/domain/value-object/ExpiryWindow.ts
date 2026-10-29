import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";

export class ExpiryWindow {
  private readonly _startDate: Date;
  private readonly _endDate: Date;
  private readonly _days: number;

  constructor(now: Date, days: number = EXPIRING_SOON_DAYS) {
    if (days < 0) {
      throw new Error("ExpiryWindow days cannot be negative.");
    }
    this._days = days;
    this._startDate = new Date(now.getTime());
    this._endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  get startDate(): Date {
    return new Date(this._startDate.getTime());
  }

  get endDate(): Date {
    return new Date(this._endDate.getTime());
  }

  get days(): number {
    return this._days;
  }
}
