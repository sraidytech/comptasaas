'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSuperAdmin, getUserRole } from '@/lib/auth';

interface RoleRedirectProps {
  children: React.ReactNode;
}

export function RoleRedirect({ children }: RoleRedirectProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Check if the user is a super admin
    if (isSuperAdmin()) {
      // Redirect to the admin dashboard
      router.push('/admin');
    }
  }, [router]);

  return <>{children}</>;
}

export function AdminRedirect({ children }: RoleRedirectProps) {
  const router = useRouter();
  
  useEffect(() => {
    const role = getUserRole();
    
    // If not a super admin, redirect to regular dashboard
    if (role && role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [router]);

  return <>{children}</>;
}
