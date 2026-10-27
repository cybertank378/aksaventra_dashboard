import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface EmailVerificationMetadataProps {
  email: string;
  token: string;
  expiresAt: Date;
}

export class EmailVerificationMetadata extends BaseValueObject<EmailVerificationMetadataProps> {
  private constructor(props: EmailVerificationMetadataProps) {
    super(props);
  }

  public static create(props: EmailVerificationMetadataProps): EmailVerificationMetadata {
    if (!props.email || !props.token) {
      throw new Error("Email and token are required for EmailVerificationMetadata");
    }
    return new EmailVerificationMetadata({
      email: props.email.toLowerCase().trim(),
      token: props.token.trim(),
      expiresAt: props.expiresAt,
    });
  }

  get email(): string {
    return this.props.email;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  public isExpired(): boolean {
    return new Date() >= this.props.expiresAt;
  }
}
