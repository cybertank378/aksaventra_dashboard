import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface PasswordResetMetadataProps {
  email: string;
  token: string;
  expiresAt: Date;
}

export class PasswordResetMetadata extends BaseValueObject<PasswordResetMetadataProps> {
  private constructor(props: PasswordResetMetadataProps) {
    super(props);
  }

  public static create(props: PasswordResetMetadataProps): PasswordResetMetadata {
    if (!props.email || !props.token) {
      throw new Error("Email and token are required for PasswordResetMetadata");
    }
    return new PasswordResetMetadata({
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
