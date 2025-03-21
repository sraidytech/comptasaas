import { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { AdminRedirect } from '@/components/auth/role-redirect';
import { LogoutButton } from '@/components/auth/logout-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRedirect>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <aside className="sticky top-0 h-screen w-64 border-r bg-white shadow-md">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-blue-600">SRACOM COMPTA</h1>
            </div>
            <div className="flex h-14 items-center justify-between border-b px-4">
              <h2 className="text-lg font-semibold text-gray-700">Administration</h2>
            </div>
            <AdminNav className="flex-1" />
          </aside>
          <div className="flex-1 flex flex-col">
            <header className="bg-white shadow-sm">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-xl font-semibold text-gray-800">Super Admin</h2>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Link href="/admin/profile">Profil</Link>
                  </Button>
                  <LogoutButton variant="outline" size="sm" />
                </div>
              </div>
            </header>
            <main className="flex-1 p-6 bg-gray-50">{children}</main>
          </div>
        </div>
      </div>
    </AdminRedirect>
  );
}
