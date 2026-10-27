import DashboardLayout from "@/components/layout/DashboardLayout";

/** The app shell is rendered once here, so the sidebar and header stay mounted while pages change. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
