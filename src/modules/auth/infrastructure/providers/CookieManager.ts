import { cookies } from "next/headers";
import type {
  CookieManagerInterface,
  CookieOptions,
} from "@/modules/auth/domain/interfaces/CookieManagerInterface";

export class CookieManager implements CookieManagerInterface {
  public async set(name: string, value: string, options?: CookieOptions): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      httpOnly: options?.httpOnly ?? true,
      secure: options?.secure ?? process.env.NODE_ENV === "production",
      sameSite: options?.sameSite ?? "lax",
      path: options?.path ?? "/",
      maxAge: options?.maxAge,
      expires: options?.expires,
    });
  }

  public async get(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  }

  public async delete(name: string, options?: CookieOptions): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete({
      name,
      path: options?.path ?? "/",
    });
  }
}
