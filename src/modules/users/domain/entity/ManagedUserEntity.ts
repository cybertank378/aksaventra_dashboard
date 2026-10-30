import { BaseEntity } from "@/core/domain/BaseEntity";
import type { UserRole } from "@/libs/enums";
import type { UserAccountState } from "@/modules/users/domain/dto/UserResponseDTO";

export interface ManagedUserProps {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ManagedUserEntity extends BaseEntity<string> {
  private props: ManagedUserProps;

  private constructor(props: ManagedUserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.props = {
      ...props,
      email: props.email.toLowerCase().trim(),
      failedLoginAttempts: props.failedLoginAttempts ?? 0,
      lockedUntil: props.lockedUntil ?? null,
    };
  }

  public static create(props: ManagedUserProps): ManagedUserEntity {
    return new ManagedUserEntity(props);
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string | null | undefined {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | null | undefined {
    return this.props.lastLoginAt;
  }

  get failedLoginAttempts(): number {
    return this.props.failedLoginAttempts ?? 0;
  }

  get lockedUntil(): Date | null | undefined {
    return this.props.lockedUntil;
  }

  public isLocked(now: Date = new Date()): boolean {
    return Boolean(this.props.lockedUntil && this.props.lockedUntil.getTime() > now.getTime());
  }

  public getAccountState(now: Date = new Date()): UserAccountState {
    if (!this.props.isActive) {
      return "INACTIVE";
    }
    if (this.isLocked(now)) {
      return "LOCKED";
    }
    return "ACTIVE";
  }

  public unlock(): void {
    this.props.lockedUntil = null;
    this.props.failedLoginAttempts = 0;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this._updatedAt = new Date();
  }

  public updateProfile(name?: string, email?: string): void {
    if (name !== undefined) {
      this.props.name = name.trim();
    }
    if (email !== undefined) {
      this.props.email = email.trim().toLowerCase();
    }
    this._updatedAt = new Date();
  }

  public changeRole(newRole: UserRole): void {
    this.props.role = newRole;
    this._updatedAt = new Date();
  }

  public toPrimitives(): ManagedUserProps {
    return {
      ...this.props,
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
