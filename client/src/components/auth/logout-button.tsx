'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/login/actions';
import { clearAuthData } from '@/lib/auth';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LogoutButton({ variant = 'outline', size = 'sm', className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the server-side logout function
      await logout();
      // Clear client-side auth data
      clearAuthData();
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if server-side logout fails, clear client-side data and redirect
      clearAuthData();
      router.push('/login');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Déconnexion
    </Button>
  );
}
