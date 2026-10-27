import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";

const scryptAsync = promisify(scrypt);

export class ArgonProvider implements PasswordHasherInterface {
  private static readonly KEY_LENGTH = 64;

  public async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, ArgonProvider.KEY_LENGTH)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  public async compare(plain: string, hashed: string): Promise<boolean> {
    const [salt, key] = hashed.split(":");
    if (!salt || !key) {
      return false;
    }

    try {
      const keyBuffer = Buffer.from(key, "hex");
      const derivedKey = (await scryptAsync(plain, salt, ArgonProvider.KEY_LENGTH)) as Buffer;
      return timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }
}
