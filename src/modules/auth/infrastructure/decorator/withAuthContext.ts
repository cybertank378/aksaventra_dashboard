import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/libs/enums";
import type { CurrentAuth } from "@/modules/auth/domain/types/CurrentAuth";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";

export type AuthenticatedHandler = (req: NextRequest, auth: CurrentAuth) => Promise<NextResponse>;

export function withAuthContext(handler: AuthenticatedHandler, requiredRole?: UserRole) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const auth = await getCurrentAuth(req);

    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
    }

    if (requiredRole && auth.role !== requiredRole) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Insufficient privileges" },
        { status: 403 },
      );
    }

    return handler(req, auth);
  };
}
