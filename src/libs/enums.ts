export type UserRole = "ADMIN";

export const UserRole = {
  ADMIN: "ADMIN",
} as const;

export type EngineStatus = "VALID" | "REVOKED" | "PENDING";

export const EngineStatus = {
  VALID: "VALID",
  REVOKED: "REVOKED",
  PENDING: "PENDING",
} as const;
