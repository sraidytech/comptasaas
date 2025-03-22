import { Metadata } from "next";
import { AuthRedirect } from "@/components/auth/role-redirect";

export const metadata: Metadata = {
  title: "Authentication - SRACOM COMPTA",
  description: "Authentication pages for SRACOM COMPTA Management System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirect>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          {children}
        </div>
      </div>
    </AuthRedirect>
  );
}
