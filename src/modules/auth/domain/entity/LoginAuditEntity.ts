import { BaseEntity } from "@/core/domain/BaseEntity";

export interface LoginAuditProps {
  id: string;
  userId?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt?: Date;
}

export class LoginAuditEntity extends BaseEntity<string> {
  private readonly _userId?: string | null;
  private readonly _action: string;
  private readonly _target?: string | null;
  private readonly _details?: string | null;
  private readonly _ipAddress?: string | null;

  private constructor(props: LoginAuditProps) {
    super(props.id, props.createdAt);
    this._userId = props.userId;
    this._action = props.action;
    this._target = props.target;
    this._details = props.details;
    this._ipAddress = props.ipAddress;
  }

  public static create(props: LoginAuditProps): LoginAuditEntity {
    return new LoginAuditEntity(props);
  }

  get userId(): string | null | undefined {
    return this._userId;
  }

  get action(): string {
    return this._action;
  }

  get target(): string | null | undefined {
    return this._target;
  }

  get details(): string | null | undefined {
    return this._details;
  }

  get ipAddress(): string | null | undefined {
    return this._ipAddress;
  }
}
