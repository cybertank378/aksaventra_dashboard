export class GrowthRateRule {
  public static calculate(currentCount: number, previousCount: number): number {
    if (currentCount === 0 && previousCount === 0) {
      return 0;
    }

    const baseline = Math.max(previousCount, 1);
    const growth = ((currentCount - previousCount) / baseline) * 100;
    return Math.round(growth * 10) / 10;
  }
}
