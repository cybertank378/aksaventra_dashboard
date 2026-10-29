/* ============================================================
 * ENGINE RELEASE ENTITY
 * ============================================================
 *
 * Responsibility:
 * - Domain entity representing an aksaventra_engine.exe binary release
 * - SemVer comparison and update eligibility logic
 * ============================================================
 */

import { BaseEntity } from "@/core/domain/BaseEntity";
import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";
import { SemVer } from "@/modules/releases/domain/value-object/SemVer";

export interface EngineReleaseProps {
  id: string;
  version: string;
  channel: ReleaseChannelType;
  minSupportedVersion?: string | null;
  mandatory: boolean;
  downloadUrl?: string | null;
  filePath?: string | null;
  checksumSha256: string;
  fileSize: bigint | number;
  releaseNotes?: string | null;
  isActive: boolean;
  downloadCount: number;
  publishedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EngineReleaseEntity extends BaseEntity<string> {
  private props: EngineReleaseProps;

  private constructor(props: EngineReleaseProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.props = { ...props };
  }

  public static create(props: EngineReleaseProps): EngineReleaseEntity {
    if (!SemVer.isValid(props.version)) {
      throw new Error(`Versi rilis tidak valid: ${props.version}. Harus mengikuti format SemVer.`);
    }

    if (props.minSupportedVersion && !SemVer.isValid(props.minSupportedVersion)) {
      throw new Error(
        `Versi minimal tidak valid: ${props.minSupportedVersion}. Harus mengikuti format SemVer.`,
      );
    }

    return new EngineReleaseEntity(props);
  }

  get version(): string {
    return this.props.version;
  }

  get channel(): ReleaseChannelType {
    return this.props.channel;
  }

  get minSupportedVersion(): string | null | undefined {
    return this.props.minSupportedVersion;
  }

  get mandatory(): boolean {
    return this.props.mandatory;
  }

  get downloadUrl(): string | null | undefined {
    return this.props.downloadUrl;
  }

  get filePath(): string | null | undefined {
    return this.props.filePath;
  }

  get checksumSha256(): string {
    return this.props.checksumSha256;
  }

  get fileSize(): bigint | number {
    return this.props.fileSize;
  }

  get releaseNotes(): string | null | undefined {
    return this.props.releaseNotes;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get downloadCount(): number {
    return this.props.downloadCount;
  }

  get publishedAt(): Date {
    return this.props.publishedAt;
  }

  public activate(): void {
    this.props.isActive = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this._updatedAt = new Date();
  }

  public incrementDownloadCount(): void {
    this.props.downloadCount += 1;
    this._updatedAt = new Date();
  }

  /**
   * Checks if this release is newer than the client's current version.
   */
  public hasUpdateFor(clientVersionStr: string): boolean {
    if (!this.props.isActive) {
      return false;
    }

    if (!SemVer.isValid(clientVersionStr)) {
      // If client version cannot be parsed, recommend updating to this release
      return true;
    }

    const clientVer = SemVer.parse(clientVersionStr);
    const releaseVer = SemVer.parse(this.props.version);

    return releaseVer.isGreaterThan(clientVer);
  }

  /**
   * Checks if this update is mandatory for the client.
   * True if:
   * 1. The release itself is marked mandatory=true, OR
   * 2. The client's version is strictly below minSupportedVersion.
   */
  public isMandatoryFor(clientVersionStr: string): boolean {
    if (this.props.mandatory) {
      return true;
    }

    if (!this.props.minSupportedVersion) {
      return false;
    }

    if (!SemVer.isValid(clientVersionStr)) {
      return true;
    }

    const clientVer = SemVer.parse(clientVersionStr);
    const minVer = SemVer.parse(this.props.minSupportedVersion);

    return clientVer.isLessThan(minVer);
  }

  public toPrimitives(): EngineReleaseProps {
    return {
      ...this.props,
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
