/* ============================================================
 * SEMVER VALUE OBJECT
 * ============================================================
 *
 * Responsibility:
 * - Parsing and validating Semantic Version strings (e.g. v2.2.1, 2.2.1-beta.1)
 * - Strict deterministic comparison (major, minor, patch, prerelease)
 * ============================================================
 */

export class SemVer {
  public readonly major: number;
  public readonly minor: number;
  public readonly patch: number;
  public readonly prerelease: string | null;
  public readonly raw: string;

  private constructor(
    major: number,
    minor: number,
    patch: number,
    prerelease: string | null,
    raw: string,
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.prerelease = prerelease;
    this.raw = raw;
  }

  public static isValid(versionStr: string): boolean {
    if (!versionStr || typeof versionStr !== "string") {
      return false;
    }
    const clean = versionStr.trim().replace(/^v/i, "");
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
    return semverRegex.test(clean);
  }

  public static parse(versionStr: string): SemVer {
    if (!versionStr || typeof versionStr !== "string") {
      throw new Error("Invalid SemVer string: value must be a non-empty string");
    }

    const clean = versionStr.trim();
    const withoutPrefix = clean.replace(/^v/i, "");
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
    const match = withoutPrefix.match(semverRegex);

    if (!match) {
      throw new Error(`Invalid SemVer format: "${versionStr}". Expected format vX.Y.Z or X.Y.Z`);
    }

    const major = Number.parseInt(match[1], 10);
    const minor = Number.parseInt(match[2], 10);
    const patch = Number.parseInt(match[3], 10);
    const prerelease = match[4] ?? null;

    return new SemVer(major, minor, patch, prerelease, clean);
  }

  /**
   * Compares this SemVer to another.
   * Returns:
   *  1 if this > other
   *  0 if this === other
   * -1 if this < other
   */
  public compare(other: SemVer): number {
    if (this.major !== other.major) {
      return this.major > other.major ? 1 : -1;
    }
    if (this.minor !== other.minor) {
      return this.minor > other.minor ? 1 : -1;
    }
    if (this.patch !== other.patch) {
      return this.patch > other.patch ? 1 : -1;
    }

    // Normal release vs prerelease: 1.0.0 is newer than 1.0.0-beta
    if (!this.prerelease && other.prerelease) {
      return 1;
    }
    if (this.prerelease && !other.prerelease) {
      return -1;
    }
    if (this.prerelease && other.prerelease) {
      return this.prerelease.localeCompare(other.prerelease);
    }

    return 0;
  }

  public isGreaterThan(other: SemVer): boolean {
    return this.compare(other) > 0;
  }

  public isLessThan(other: SemVer): boolean {
    return this.compare(other) < 0;
  }

  public isEqualTo(other: SemVer): boolean {
    return this.compare(other) === 0;
  }

  public isGreaterThanOrEqualTo(other: SemVer): boolean {
    return this.compare(other) >= 0;
  }

  public isLessThanOrEqualTo(other: SemVer): boolean {
    return this.compare(other) <= 0;
  }

  public toString(): string {
    return this.raw.startsWith("v") || this.raw.startsWith("V")
      ? `v${this.major}.${this.minor}.${this.patch}${this.prerelease ? `-${this.prerelease}` : ""}`
      : `${this.major}.${this.minor}.${this.patch}${this.prerelease ? `-${this.prerelease}` : ""}`;
  }
}
