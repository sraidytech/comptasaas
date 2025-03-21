'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  CheckSquare, 
  Settings, 
  User 
} from 'lucide-react';

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState('/dashboard');

  const navItems = [
    {
      title: 'Tableau de Bord',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Clients',
      href: '/clients',
      icon: Users,
    },
    {
      title: 'Déclarations',
      href: '/declarations',
      icon: FileText,
    },
    {
      title: 'Livres',
      href: '/livres',
      icon: BookOpen,
    },
    {
      title: 'Tâches',
      href: '/tasks',
      icon: CheckSquare,
    },
    {
      title: 'Utilisateurs',
      href: '/users',
      icon: User,
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen w-64 border-r bg-white shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">SRACOM COMPTA</h1>
          </div>
          <nav className="flex flex-col gap-2 p-4 mt-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.href || activeItem.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveItem(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-semibold text-gray-800">Tableau de Bord</h2>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Link href="/profile">Profil</Link>
                </Button>
                <LogoutButton variant="outline" size="sm" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 bg-gray-50">
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold">Bienvenue sur SRACOM COMPTA Management System</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-2">Total Clients</h2>
                  <p className="text-gray-600 text-sm mb-2">Tous les clients enregistrés</p>
                  <p className="text-3xl font-bold">125</p>
                  <p className="text-green-500 text-sm">+5.2% depuis le mois dernier</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-2">Déclarations en Attente</h2>
              <p className="text-gray-600 text-sm mb-2">Déclarations en attente d&apos;action</p>
                  <p className="text-3xl font-bold">42</p>
                  <p className="text-red-500 text-sm">+12% depuis le mois dernier</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-2">Déclarations Complétées</h2>
                  <p className="text-gray-600 text-sm mb-2">Déclarations traitées avec succès</p>
                  <p className="text-3xl font-bold">89</p>
                  <p className="text-green-500 text-sm">+8.3% depuis le mois dernier</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-2">Tâches en Attente</h2>
                  <p className="text-gray-600 text-sm mb-2">Tâches nécessitant attention</p>
                  <p className="text-3xl font-bold">17</p>
                  <p className="text-red-500 text-sm">-2.1% depuis le mois dernier</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Déclarations Récentes</h2>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">Déclaration #{1000 + i}</p>
                          <p className="text-sm text-gray-600">Client: ACME Corporation</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Soumis: 20/03/2025</p>
                          <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">En attente</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Tâches à Venir</h2>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">Réviser État Financier</p>
                          <p className="text-sm text-gray-600">Client: Tech Innovations Inc.</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Échéance: 20/03/2025</p>
                          <span className="inline-block px-2 py-1 text-xs rounded bg-red-100 text-red-800">Haute Priorité</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
