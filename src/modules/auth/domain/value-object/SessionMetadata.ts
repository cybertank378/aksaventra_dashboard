import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface SessionMetadataProps {
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionMetadata extends BaseValueObject<SessionMetadataProps> {
  private constructor(props: SessionMetadataProps) {
    super(props);
  }

  public static create(props: SessionMetadataProps): SessionMetadata {
    return new SessionMetadata({
      lastActiveAt: props.lastActiveAt,
      ipAddress: props.ipAddress?.trim(),
      userAgent: props.userAgent?.trim(),
    });
  }

  get lastActiveAt(): Date {
    return this.props.lastActiveAt;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }
}
