import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";
import DashboardOverviewPage from "@/sections/dashboard/pages/DashboardOverviewPage";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <DashboardOverviewPage userRole={user?.role ?? "ADMIN"} />;
}
