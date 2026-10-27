export type UserRole = "ADMIN";

export interface UserAuthContext {
  userId: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

export interface AuthorizationRule {
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  customValidator?: (context: UserAuthContext) => boolean | Promise<boolean>;
}
