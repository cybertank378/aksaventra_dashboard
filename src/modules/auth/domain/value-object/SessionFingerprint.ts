import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface SessionFingerprintProps {
  hash: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionFingerprint extends BaseValueObject<SessionFingerprintProps> {
  private constructor(props: SessionFingerprintProps) {
    super(props);
  }

  public static create(props: SessionFingerprintProps): SessionFingerprint {
    if (!props.hash || props.hash.trim().length === 0) {
      throw new Error("SessionFingerprint hash cannot be empty");
    }
    return new SessionFingerprint({
      hash: props.hash.trim(),
      ipAddress: props.ipAddress?.trim(),
      userAgent: props.userAgent?.trim(),
    });
  }

  get hash(): string {
    return this.props.hash;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }
}
