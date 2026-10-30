import type { LicenseValidationResult } from "@prisma/client";
import { LatencyThresholdRule } from "../rules/LatencyThresholdRule";
import { SuspiciousValidationRule } from "../rules/SuspiciousValidationRule";

export interface ValidationLogEntityProps {
  id: string;
  licenseId: string | null;
  clientName?: string | null;
  serialKeyHint: string;
  hwidHash: string | null;
  result: LicenseValidationResult;
  statusCode: number;
  engineVersion: string | null;
  clientIp: string | null;
  userAgent: string | null;
  latencyMs: number | null;
  checkedAt: Date;
}

export class ValidationLogReadEntity {
  private constructor(private readonly props: ValidationLogEntityProps) {}

  public static create(props: ValidationLogEntityProps): ValidationLogReadEntity {
    return new ValidationLogReadEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get licenseId(): string | null {
    return this.props.licenseId;
  }

  get clientName(): string | null {
    return this.props.clientName ?? null;
  }

  get serialKeyHint(): string {
    return this.props.serialKeyHint;
  }

  get hwidHash(): string | null {
    return this.props.hwidHash;
  }

  get result(): LicenseValidationResult {
    return this.props.result;
  }

  get statusCode(): number {
    return this.props.statusCode;
  }

  get engineVersion(): string | null {
    return this.props.engineVersion;
  }

  get clientIp(): string | null {
    return this.props.clientIp;
  }

  get userAgent(): string | null {
    return this.props.userAgent;
  }

  get latencyMs(): number | null {
    return this.props.latencyMs;
  }

  get checkedAt(): Date {
    return this.props.checkedAt;
  }

  public isAnomaly(): boolean {
    return SuspiciousValidationRule.isSuspicious(this.props.result, this.props.statusCode);
  }

  public isSlowResponse(): boolean {
    return LatencyThresholdRule.isSlaBreached(this.props.latencyMs);
  }

  public toJSON(): ValidationLogEntityProps {
    return { ...this.props };
  }
}
