import { BaseEntity } from "@/core/domain/BaseEntity";
import type { ValidateLicenseSuccessResponseDTO } from "../dto/LicenseResponseDTO";

export type LicenseStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";

export interface LicenseProps {
  id: string;
  serialKey: string;
  hwid?: string | null;
  clientName: string;
  vaultSecret: string;
  status: LicenseStatus;
  expiresAt?: Date | null;
  activatedAt?: Date | null;
  lastVerifiedAt?: Date | null;
  engineVersion?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LicenseEntity extends BaseEntity<string> {
  private props: LicenseProps;

  private constructor(props: LicenseProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.props = { ...props };
  }

  public static create(props: LicenseProps): LicenseEntity {
    return new LicenseEntity(props);
  }

  get serialKey(): string {
    return this.props.serialKey;
  }

  get hwid(): string | null | undefined {
    return this.props.hwid;
  }

  get clientName(): string {
    return this.props.clientName;
  }

  get vaultSecret(): string {
    return this.props.vaultSecret;
  }

  get status(): LicenseStatus {
    return this.props.status;
  }

  get expiresAt(): Date | null | undefined {
    return this.props.expiresAt;
  }

  get activatedAt(): Date | null | undefined {
    return this.props.activatedAt;
  }

  get lastVerifiedAt(): Date | null | undefined {
    return this.props.lastVerifiedAt;
  }

  get engineVersion(): string | null | undefined {
    return this.props.engineVersion;
  }

  public isExpired(): boolean {
    if (!this.props.expiresAt) {
      return false;
    }
    return this.props.expiresAt.getTime() < Date.now();
  }

  public isActive(): boolean {
    if (this.isExpired()) {
      return false;
    }
    return this.props.status === "ACTIVE";
  }

  public hasHardwareBinding(): boolean {
    return Boolean(this.props.hwid && this.props.hwid.trim().length > 0);
  }

  public matchesHardwareId(hwid: string): boolean {
    if (!this.props.hwid) {
      return false;
    }
    return this.props.hwid.trim() === hwid.trim();
  }

  public bindHardwareId(hwid: string): void {
    const trimmedHwid = hwid.trim();
    this.props.hwid = trimmedHwid;
    this.props.activatedAt = new Date();
    this.props.lastVerifiedAt = new Date();
    this._updatedAt = new Date();
  }

  public markVerified(engineVersion?: string): void {
    this.props.lastVerifiedAt = new Date();
    if (engineVersion) {
      this.props.engineVersion = engineVersion;
    }
    this._updatedAt = new Date();
  }

  public toResponseContract(
    message = "Lisensi aktif dan terverifikasi untuk perangkat ini.",
  ): ValidateLicenseSuccessResponseDTO {
    const expiresAtUnix = this.props.expiresAt
      ? Math.floor(this.props.expiresAt.getTime() / 1000)
      : undefined;

    return {
      valid: true,
      message,
      client_name: this.props.clientName,
      vault_secret: this.props.vaultSecret,
      expires_at: expiresAtUnix,
    };
  }

  public toPrimitives(): LicenseProps {
    return {
      ...this.props,
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
