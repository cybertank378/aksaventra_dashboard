import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface AccessTokenProps {
  token: string;
  expiresAt: Date;
}

export class AccessToken extends BaseValueObject<AccessTokenProps> {
  private constructor(props: AccessTokenProps) {
    super(props);
  }

  public static create(token: string, expiresAt: Date): AccessToken {
    if (!token || token.trim().length === 0) {
      throw new Error("AccessToken cannot be empty");
    }
    return new AccessToken({ token: token.trim(), expiresAt });
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
