export class EmailVerificationRule {
  public static isTokenUsable(isUsed: boolean, expiresAt: Date): boolean {
    return !isUsed && new Date() < expiresAt;
  }
}
