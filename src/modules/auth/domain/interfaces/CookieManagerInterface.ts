export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
}

export interface CookieManagerInterface {
  set(name: string, value: string, options?: CookieOptions): Promise<void> | void;
  get(name: string): Promise<string | undefined> | string | undefined;
  delete(name: string, options?: CookieOptions): Promise<void> | void;
}
