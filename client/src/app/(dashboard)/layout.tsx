import { Metadata } from "next";
import { RoleRedirect } from "@/components/auth/role-redirect";

export const metadata: Metadata = {
  title: "Dashboard - SRACOM COMPTA",
  description: "SRACOM COMPTA Management System Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRedirect>
      {children}
    </RoleRedirect>
  );
}
