import crypto from "node:crypto";
import { BaseEntity } from "@/core/domain/BaseEntity";

export type LicenseValidationResultType =
  | "ACTIVATED"
  | "VERIFIED"
  | "NOT_FOUND"
  | "EXPIRED"
  | "SUSPENDED"
  | "HWID_MISMATCH"
  | "BAD_REQUEST";

export interface LicenseValidationLogProps {
  id?: string;
  licenseId?: string | null;
  serialKeyHint: string;
  hwidHash?: string | null;
  result: LicenseValidationResultType;
  statusCode: number;
  engineVersion?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  latencyMs?: number | null;
  checkedAt?: Date;
}

export interface CreateLicenseValidationLogProps {
  id?: string;
  licenseId?: string | null;
  serialKey: string;
  hwid?: string | null;
  result: LicenseValidationResultType;
  statusCode: number;
  engineVersion?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  latencyMs?: number | null;
  checkedAt?: Date;
}

export class LicenseValidationLogEntity extends BaseEntity<string> {
  private props: LicenseValidationLogProps;

  private constructor(props: LicenseValidationLogProps) {
    const id = props.id ?? crypto.randomUUID();
    super(id, props.checkedAt ?? new Date(), props.checkedAt ?? new Date());
    this.props = {
      ...props,
      id,
      checkedAt: props.checkedAt ?? new Date(),
    };
  }

  public static create(raw: CreateLicenseValidationLogProps): LicenseValidationLogEntity {
    const cleanKey = (raw.serialKey ?? "").trim();
    const serialKeyHint = cleanKey.length > 4 ? cleanKey.slice(-4) : cleanKey;

    let hwidHash: string | null = null;
    if (raw.hwid && raw.hwid.trim().length > 0) {
      hwidHash = crypto.createHash("sha256").update(raw.hwid.trim()).digest("hex");
    }

    return new LicenseValidationLogEntity({
      id: raw.id,
      licenseId: raw.licenseId ?? null,
      serialKeyHint,
      hwidHash,
      result: raw.result,
      statusCode: raw.statusCode,
      engineVersion: raw.engineVersion ?? null,
      clientIp: raw.clientIp ?? null,
      userAgent: raw.userAgent ?? null,
      latencyMs: raw.latencyMs ?? null,
      checkedAt: raw.checkedAt ?? new Date(),
    });
  }

  public static fromPersisted(props: LicenseValidationLogProps): LicenseValidationLogEntity {
    return new LicenseValidationLogEntity(props);
  }

  get licenseId(): string | null | undefined {
    return this.props.licenseId;
  }

  get serialKeyHint(): string {
    return this.props.serialKeyHint;
  }

  get hwidHash(): string | null | undefined {
    return this.props.hwidHash;
  }

  get result(): LicenseValidationResultType {
    return this.props.result;
  }

  get statusCode(): number {
    return this.props.statusCode;
  }

  get engineVersion(): string | null | undefined {
    return this.props.engineVersion;
  }

  get clientIp(): string | null | undefined {
    return this.props.clientIp;
  }

  get userAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  get latencyMs(): number | null | undefined {
    return this.props.latencyMs;
  }

  get checkedAt(): Date {
    return this.props.checkedAt ?? this.createdAt;
  }
}
