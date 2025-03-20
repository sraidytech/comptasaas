import { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { AdminRedirect } from '@/components/auth/role-redirect';
import { LogoutButton } from '@/components/auth/logout-button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRedirect>
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside className="sticky top-0 h-screen w-64 border-r bg-background">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <h2 className="text-lg font-semibold">Administration</h2>
          </div>
          <AdminNav className="flex-1" />
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-semibold">Super Admin</h2>
              <div className="flex items-center space-x-4">
                <LogoutButton />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
    </AdminRedirect>
  );
}
