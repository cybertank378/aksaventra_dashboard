import { BaseEntity } from "@/core/domain/BaseEntity";
import type { UserRole } from "@/libs/enums";

export interface UserCredentialProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserCredentialEntity extends BaseEntity<string> {
  private _email: string;
  private _passwordHash: string;
  private _name?: string | null;
  private _role: UserRole;
  private _isActive: boolean;
  private _lastLoginAt?: Date | null;

  private constructor(props: UserCredentialProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = props.email.toLowerCase().trim();
    this._passwordHash = props.passwordHash;
    this._name = props.name;
    this._role = props.role;
    this._isActive = props.isActive;
    this._lastLoginAt = props.lastLoginAt;
  }

  public static create(props: UserCredentialProps): UserCredentialEntity {
    return new UserCredentialEntity(props);
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string | null | undefined {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null | undefined {
    return this._lastLoginAt;
  }

  public updatePassword(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  public recordLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }
}
