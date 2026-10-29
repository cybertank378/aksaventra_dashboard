export class AuthCookieHelper {
  public static getAuthToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  }

  public static removeAuthToken(): void {
    if (typeof document === "undefined") return;
    // biome-ignore lint/suspicious/noDocumentCookie: standard client cookie removal
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}
