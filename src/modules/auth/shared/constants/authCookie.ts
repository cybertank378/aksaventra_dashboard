/**
 * Authentication Cookie Constants
 */
export const AUTH_COOKIE = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export type AuthCookieKey = (typeof AUTH_COOKIE)[keyof typeof AUTH_COOKIE];
