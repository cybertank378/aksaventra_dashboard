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

  public static readonly ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

  public isExpired(): boolean {
    if (this.props.status === "EXPIRED") {
      return true;
    }

    const now = Date.now();

    // 1. Cek tanggal kedaluwarsa eksplisit jika ada
    if (this.props.expiresAt && this.props.expiresAt.getTime() <= now) {
      return true;
    }

    // 2. Evaluasi otonom batas umur 1 tahun (365 hari)
    const baseDate = this.props.activatedAt ?? this.props.createdAt ?? this._createdAt;
    if (baseDate) {
      const ageMs = now - baseDate.getTime();
      if (ageMs >= LicenseEntity.ONE_YEAR_MS) {
        return true;
      }
    }

    return false;
  }

  public isActive(): boolean {
    if (this.isExpired()) {
      return false;
    }
    return this.props.status === "ACTIVE";
  }

  public markExpired(): void {
    this.props.status = "EXPIRED";
    this._updatedAt = new Date();
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
    const now = new Date();
    this.props.hwid = trimmedHwid;
    this.props.activatedAt = now;
    this.props.lastVerifiedAt = now;
    if (!this.props.expiresAt) {
      this.props.expiresAt = new Date(now.getTime() + LicenseEntity.ONE_YEAR_MS);
    }
    this._updatedAt = now;
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
