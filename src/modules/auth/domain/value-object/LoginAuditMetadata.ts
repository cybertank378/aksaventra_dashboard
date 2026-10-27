import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface LoginAuditMetadataProps {
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  timestamp: Date;
}

export class LoginAuditMetadata extends BaseValueObject<LoginAuditMetadataProps> {
  private constructor(props: LoginAuditMetadataProps) {
    super(props);
  }

  public static create(props: LoginAuditMetadataProps): LoginAuditMetadata {
    return new LoginAuditMetadata({
      ipAddress: props.ipAddress?.trim(),
      userAgent: props.userAgent?.trim(),
      reason: props.reason?.trim(),
      timestamp: props.timestamp ?? new Date(),
    });
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get reason(): string | undefined {
    return this.props.reason;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }
}
