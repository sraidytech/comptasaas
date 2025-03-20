'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/login/actions';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LogoutButton({ variant = 'outline', size = 'sm' }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <Button variant={variant} size={size} onClick={handleLogout}>
      Déconnexion
    </Button>
  );
}
