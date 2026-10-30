import { randomBytes } from "node:crypto";

export type LicenseTierRule = "TRIAL" | "PRO" | "ENTERPRISE";

export class SerialKeyGeneratorRule {
  /**
   * Menghasilkan serial key acak dengan format standar:
   * AKSA-[TIER]-[YEAR]-[RANDOM_HEX]
   * Contoh: AKSA-PRO-2026-9F2A
   */
  public static generate(
    tier: LicenseTierRule = "PRO",
    year: number = new Date().getFullYear(),
  ): string {
    const rawRandom = randomBytes(2).toString("hex").toUpperCase();
    return `AKSA-${tier}-${year}-${rawRandom}`;
  }

  /**
   * Menghasilkan serial key dengan format 4 blok (AKSA-XXXX-XXXX-XXXX)
   */
  public static generateBlockFormat(): string {
    const b1 = randomBytes(2).toString("hex").toUpperCase();
    const b2 = randomBytes(2).toString("hex").toUpperCase();
    const b3 = randomBytes(2).toString("hex").toUpperCase();
    return `AKSA-${b1}-${b2}-${b3}`;
  }

  /**
   * Menghasilkan cryptographic vault secret (64 karakter hexadecimal / 32 bytes)
   */
  public static generateVaultSecret(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Memvalidasi format dasar serial key Aksaventra
   */
  public static isValidFormat(key: string): boolean {
    if (!key || typeof key !== "string") return false;
    const trimmed = key.trim().toUpperCase();
    return (
      /^AKSA-[A-Z0-9]{2,12}-[A-Z0-9]{2,8}-[A-Z0-9]{2,8}$/.test(trimmed) ||
      /^AKSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed)
    );
  }
}
