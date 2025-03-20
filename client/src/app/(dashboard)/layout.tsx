import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleRedirect } from "@/components/auth/role-redirect";
import { LogoutButton } from "@/components/auth/logout-button";

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold">SRACOM COMPTA</h1>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-100">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/clients" className="block p-2 rounded hover:bg-gray-100">
                Clients
              </Link>
            </li>
            <li>
              <Link href="/declarations" className="block p-2 rounded hover:bg-gray-100">
                Declarations
              </Link>
            </li>
            <li>
              <Link href="/livres" className="block p-2 rounded hover:bg-gray-100">
                Livres
              </Link>
            </li>
            <li>
              <Link href="/tasks" className="block p-2 rounded hover:bg-gray-100">
                Tasks
              </Link>
            </li>
            <li>
              <Link href="/users" className="block p-2 rounded hover:bg-gray-100">
                Users
              </Link>
            </li>
            <li>
              <Link href="/settings" className="block p-2 rounded hover:bg-gray-100">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Profil
              </Button>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
    </RoleRedirect>
  );
}
