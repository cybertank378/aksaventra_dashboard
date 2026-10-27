export class AccountLockRule {
  private static readonly MAX_FAILED_ATTEMPTS = 5;

  public static isLocked(failedAttemptsCount: number): boolean {
    return failedAttemptsCount >= AccountLockRule.MAX_FAILED_ATTEMPTS;
  }
}
