import * as argon2 from "argon2";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";

export class ArgonProvider implements PasswordHasherInterface {
  public async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  public async compare(plain: string, hashed: string): Promise<boolean> {
    try {
      return await argon2.verify(hashed, plain);
    } catch {
      return false;
    }
  }
}
