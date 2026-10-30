/* ============================================================
 * RELEASE CHANNEL VALUE OBJECT
 * ============================================================
 */

export type ReleaseChannelType = "STABLE" | "BETA" | "NIGHTLY";

export class ReleaseChannelVO {
  public static readonly ALLOWED_CHANNELS: readonly ReleaseChannelType[] = [
    "STABLE",
    "BETA",
    "NIGHTLY",
  ] as const;

  public readonly value: ReleaseChannelType;

  private constructor(value: ReleaseChannelType) {
    this.value = value;
  }

  public static create(input?: string | null): ReleaseChannelVO {
    if (!input || typeof input !== "string") {
      return new ReleaseChannelVO("STABLE");
    }

    const normalized = input.trim().toUpperCase();
    if (normalized === "BETA") {
      return new ReleaseChannelVO("BETA");
    }
    if (normalized === "NIGHTLY") {
      return new ReleaseChannelVO("NIGHTLY");
    }
    return new ReleaseChannelVO("STABLE");
  }

  public isStable(): boolean {
    return this.value === "STABLE";
  }

  public isBeta(): boolean {
    return this.value === "BETA";
  }

  public isNightly(): boolean {
    return this.value === "NIGHTLY";
  }

  public toString(): string {
    return this.value;
  }
}
