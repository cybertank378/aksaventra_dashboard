import { BaseEntity } from "@/core/domain/BaseEntity";

export interface UserSessionProps {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export class UserSessionEntity extends BaseEntity<string> {
  private readonly _userId: string;
  private readonly _token: string;
  private _expiresAt: Date;
  private readonly _ipAddress?: string | null;
  private readonly _userAgent?: string | null;

  private constructor(props: UserSessionProps) {
    super(props.id, props.createdAt);
    this._userId = props.userId;
    this._token = props.token;
    this._expiresAt = props.expiresAt;
    this._ipAddress = props.ipAddress;
    this._userAgent = props.userAgent;
  }

  public static create(props: UserSessionProps): UserSessionEntity {
    return new UserSessionEntity(props);
  }

  get userId(): string {
    return this._userId;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get ipAddress(): string | null | undefined {
    return this._ipAddress;
  }

  get userAgent(): string | null | undefined {
    return this._userAgent;
  }

  public isExpired(): boolean {
    return new Date() >= this._expiresAt;
  }

  public expireNow(): void {
    this._expiresAt = new Date();
  }
}
