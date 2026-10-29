import type { ReactNode } from "react";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import AppLayout from "@/shared-ui/layout/AppLayout";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return <AppLayout role={user?.role ?? "ADMIN"}>{children}</AppLayout>;
}
