export type UserRole = "ADMIN" | "OPERATOR" | "AUDITOR";

export const UserRole = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
  AUDITOR: "AUDITOR",
} as const;

export type EngineStatus = "VALID" | "REVOKED" | "PENDING";

export const EngineStatus = {
  VALID: "VALID",
  REVOKED: "REVOKED",
  PENDING: "PENDING",
} as const;
