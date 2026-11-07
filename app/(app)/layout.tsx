
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
