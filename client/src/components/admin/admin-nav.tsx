"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building,
  Users,
  FileText,
  BookOpen,
  Shield,
  Settings,
  Home,
} from 'lucide-react';

interface AdminNavProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean;
}

export function AdminNav({ className, isCollapsed, ...props }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Tableau de Bord',
      href: '/admin',
      icon: Home,
    },
    {
      title: 'Locataires',
      href: '/admin/tenants',
      icon: Building,
    },
    {
      title: 'Utilisateurs',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Types de Déclaration',
      href: '/admin/declaration-types',
      icon: FileText,
    },
    {
      title: 'Types de Livre',
      href: '/admin/livre-types',
      icon: BookOpen,
    },
    {
      title: 'Rôles & Permissions',
      href: '/admin/roles',
      icon: Shield,
    },
    {
      title: 'Paramètres',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <nav className={cn('flex flex-col gap-2 p-2', className)} {...props}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground',
              isCollapsed && 'justify-center'
            )}
          >
            <item.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : '')} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
