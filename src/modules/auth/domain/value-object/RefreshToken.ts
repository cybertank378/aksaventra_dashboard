import { BaseValueObject } from "@/core/domain/BaseValueObject";

export interface RefreshTokenProps {
  token: string;
  expiresAt: Date;
}

export class RefreshToken extends BaseValueObject<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps) {
    super(props);
  }

  public static create(token: string, expiresAt: Date): RefreshToken {
    if (!token || token.trim().length === 0) {
      throw new Error("RefreshToken cannot be empty");
    }
    return new RefreshToken({ token: token.trim(), expiresAt });
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
