/* ============================================================
 * ENGINE UPDATE LOG ENTITY
 * ============================================================
 *
 * Responsibility:
 * - Domain entity representing an auto-updater telemetry log
 * ============================================================
 */

import { BaseEntity } from "@/core/domain/BaseEntity";

export type UpdateActionType = "CHECK" | "DOWNLOAD";
export type UpdateStatusType = "SUCCESS" | "FAILED";

export interface EngineUpdateLogProps {
  id: string;
  releaseId?: string | null;
  clientVersion: string;
  hwid?: string | null;
  serialKey?: string | null;
  channel: string;
  action: UpdateActionType;
  status: UpdateStatusType;
  clientIp?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export class EngineUpdateLogEntity extends BaseEntity<string> {
  private props: EngineUpdateLogProps;

  private constructor(props: EngineUpdateLogProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.props = { ...props };
  }

  public static create(
    props: Omit<EngineUpdateLogProps, "id"> & { id?: string },
  ): EngineUpdateLogEntity {
    const id = props.id ?? crypto.randomUUID();
    const createdAt = props.createdAt ?? new Date();
    return new EngineUpdateLogEntity({
      ...props,
      id,
      createdAt,
    });
  }

  get releaseId(): string | null | undefined {
    return this.props.releaseId;
  }

  get clientVersion(): string {
    return this.props.clientVersion;
  }

  get hwid(): string | null | undefined {
    return this.props.hwid;
  }

  get serialKey(): string | null | undefined {
    return this.props.serialKey;
  }

  get channel(): string {
    return this.props.channel;
  }

  get action(): UpdateActionType {
    return this.props.action;
  }

  get status(): UpdateStatusType {
    return this.props.status;
  }

  get clientIp(): string | null | undefined {
    return this.props.clientIp;
  }

  get userAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  public toPrimitives(): EngineUpdateLogProps {
    return {
      ...this.props,
      id: this._id,
      createdAt: this._createdAt,
    };
  }
}
