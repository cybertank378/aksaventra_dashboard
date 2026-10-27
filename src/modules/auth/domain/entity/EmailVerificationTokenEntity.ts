import { BaseEntity } from "@/core/domain/BaseEntity";

export interface EmailVerificationTokenProps {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt?: Date;
}

export class EmailVerificationTokenEntity extends BaseEntity<string> {
  private readonly _userId: string;
  private readonly _token: string;
  private readonly _expiresAt: Date;
  private _isUsed: boolean;

  private constructor(props: EmailVerificationTokenProps) {
    super(props.id, props.createdAt);
    this._userId = props.userId;
    this._token = props.token;
    this._expiresAt = props.expiresAt;
    this._isUsed = props.isUsed;
  }

  public static create(props: EmailVerificationTokenProps): EmailVerificationTokenEntity {
    return new EmailVerificationTokenEntity(props);
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

  get isUsed(): boolean {
    return this._isUsed;
  }

  public markAsUsed(): void {
    this._isUsed = true;
  }

  public isValid(): boolean {
    return !this._isUsed && new Date() < this._expiresAt;
  }
}
