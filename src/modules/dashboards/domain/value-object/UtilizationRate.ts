export class UtilizationRate {
  private readonly _rate: number;

  constructor(activeWithHwid: number, totalActive: number) {
    if (activeWithHwid < 0 || totalActive < 0) {
      throw new Error("Active count cannot be negative.");
    }

    if (totalActive === 0) {
      this._rate = 0;
      return;
    }

    const calculated = (activeWithHwid / totalActive) * 100;
    // Format to 1 decimal place and clamp between 0 and 100
    const clamped = Math.min(100, Math.max(0, calculated));
    this._rate = Math.round(clamped * 10) / 10;
  }

  get value(): number {
    return this._rate;
  }

  public toFormattedString(): string {
    return `${this._rate.toFixed(1)}%`;
  }
}
