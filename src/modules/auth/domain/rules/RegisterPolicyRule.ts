export class RegisterPolicyRule {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public static validate(email: string): { isValid: boolean; message?: string } {
    if (!email || !RegisterPolicyRule.EMAIL_REGEX.test(email.trim())) {
      return {
        isValid: false,
        message: "A valid email address is required for registration.",
      };
    }
    return { isValid: true };
  }
}
