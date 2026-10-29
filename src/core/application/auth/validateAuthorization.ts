import type { AuthorizationRule, UserAuthContext } from "./AuthorizationRule";

export async function validateAuthorization(
  context: UserAuthContext,
  rule: AuthorizationRule,
): Promise<{ isAuthorized: boolean; reason?: string }> {
  if (rule.allowedRoles && rule.allowedRoles.length > 0) {
    if (!rule.allowedRoles.includes(context.role)) {
      return {
        isAuthorized: false,
        reason: `Role '${context.role}' is not allowed to access this resource`,
      };
    }
  }

  if (rule.requiredPermissions && rule.requiredPermissions.length > 0) {
    const userPermissions = context.permissions ?? [];
    const missingPermissions = rule.requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm),
    );

    if (missingPermissions.length > 0) {
      return {
        isAuthorized: false,
        reason: `Missing required permission(s): ${missingPermissions.join(", ")}`,
      };
    }
  }

  if (rule.customValidator) {
    const customValid = await rule.customValidator(context);
    if (!customValid) {
      return {
        isAuthorized: false,
        reason: "Access denied by custom authorization policy",
      };
    }
  }

  return { isAuthorized: true };
}
