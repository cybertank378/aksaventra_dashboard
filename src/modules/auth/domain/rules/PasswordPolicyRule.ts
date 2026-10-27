export class PasswordPolicyRule {
  private static readonly MIN_LENGTH = 8;

  public static validate(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length < PasswordPolicyRule.MIN_LENGTH) {
      return {
        isValid: false,
        message: `Password must be at least ${PasswordPolicyRule.MIN_LENGTH} characters long.`,
      };
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        message: "Password must contain both letters and numbers.",
      };
    }

    return { isValid: true };
  }
}
