'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isSuperAdmin, getUserRole, isAuthenticated } from '@/lib/auth';
import { logRedirection } from '@/lib/auth-debug';
import { Loader2 } from 'lucide-react';

interface RoleRedirectProps {
  children: React.ReactNode;
}

// Component for regular user routes - redirects super admins to admin dashboard
export function RoleRedirect({ children }: RoleRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  useEffect(() => {
    console.log("RoleRedirect: Component mounted, attempt:", redirectAttempts);
    
    // Prevent infinite redirects
    if (redirectAttempts > 2) {
      console.log("RoleRedirect: Too many redirect attempts, showing content");
      logRedirection(pathname, pathname, 'Too many redirect attempts, showing content anyway');
      setIsLoading(false);
      return;
    }
    
    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      try {
        // Check if the user is authenticated
        const authenticated = isAuthenticated();
        console.log("RoleRedirect: isAuthenticated =", authenticated);
        
        if (!authenticated) {
          // Redirect to login if not authenticated
          console.log("RoleRedirect: User not authenticated, redirecting to login");
          logRedirection(pathname, '/login', 'User not authenticated');
          router.push('/login');
          return;
        }
        
        // Check if the user is a super admin
        const superAdmin = isSuperAdmin();
        console.log("RoleRedirect: isSuperAdmin =", superAdmin);
        
        // Only redirect if we're not already on the admin page
        // This prevents the infinite redirect loop
        if (superAdmin && !pathname.startsWith('/admin')) {
          // Redirect to the admin dashboard
          console.log("RoleRedirect: User is super admin, redirecting to admin");
          logRedirection(pathname, '/admin', 'User is super admin');
          router.push('/admin');
          setRedirectAttempts(prev => prev + 1);
          return;
        }
        
        // User is authenticated and not a super admin, show content
        console.log("RoleRedirect: User authenticated and not super admin, showing content");
        setIsLoading(false);
      } catch (error) {
        console.error("RoleRedirect error:", error);
        // On error, show content
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router, pathname, redirectAttempts]);

  // Force show content after 2 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("RoleRedirect: Force showing content after timeout");
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement...</span>
      </div>
    );
  }

  return <>{children}</>;
}

// Component for admin routes - redirects non-super-admins to regular dashboard
export function AdminRedirect({ children }: RoleRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  useEffect(() => {
    console.log("AdminRedirect: Component mounted, attempt:", redirectAttempts);
    
    // Prevent infinite redirects
    if (redirectAttempts > 2) {
      console.log("AdminRedirect: Too many redirect attempts, showing content");
      logRedirection(pathname, pathname, 'Too many redirect attempts, showing content anyway');
      setIsLoading(false);
      return;
    }
    
    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      try {
        // Check if the user is authenticated
        const authenticated = isAuthenticated();
        console.log("AdminRedirect: isAuthenticated =", authenticated);
        
        if (!authenticated) {
          // Redirect to login if not authenticated
          console.log("AdminRedirect: User not authenticated, redirecting to login");
          logRedirection(pathname, '/login', 'User not authenticated');
          router.push('/login');
          return;
        }
        
        const role = getUserRole();
        console.log("AdminRedirect: User role =", role);
        
        // If not a super admin, redirect to regular dashboard
        if (role && role !== 'SUPER_ADMIN') {
          console.log("AdminRedirect: User is not super admin, redirecting to dashboard");
          logRedirection(pathname, '/dashboard', `User role is ${role}, not SUPER_ADMIN`);
          router.push('/dashboard');
          setRedirectAttempts(prev => prev + 1);
          return;
        }
        
        // User is authenticated and is a super admin, show content
        console.log("AdminRedirect: User is super admin, showing content");
        setIsLoading(false);
      } catch (error) {
        console.error("AdminRedirect error:", error);
        // On error, show content instead of redirecting to prevent loops
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router, pathname, redirectAttempts]);

  // Force show content after 2 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("AdminRedirect: Force showing content after timeout");
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement...</span>
      </div>
    );
  }

  return <>{children}</>;
}

// Component for auth routes - redirects authenticated users to appropriate dashboard
export function AuthRedirect({ children }: RoleRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  useEffect(() => {
    console.log("AuthRedirect: Component mounted, attempt:", redirectAttempts);
    
    // Prevent infinite redirects
    if (redirectAttempts > 2) {
      console.log("AuthRedirect: Too many redirect attempts, showing content");
      logRedirection(pathname, pathname, 'Too many redirect attempts, showing content anyway');
      setIsLoading(false);
      return;
    }
    
    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      try {
        // Check if the user is already authenticated
        const authenticated = isAuthenticated();
        console.log("AuthRedirect: isAuthenticated =", authenticated);
        
        if (authenticated) {
          // Redirect based on role
          const superAdmin = isSuperAdmin();
          console.log("AuthRedirect: isSuperAdmin =", superAdmin);
          
          if (superAdmin) {
            console.log("AuthRedirect: User is super admin, redirecting to admin");
            logRedirection(pathname, '/admin', 'User is authenticated and is SUPER_ADMIN');
            router.push('/admin');
            setRedirectAttempts(prev => prev + 1);
          } else {
            console.log("AuthRedirect: User is not super admin, redirecting to dashboard");
            logRedirection(pathname, '/dashboard', 'User is authenticated but not SUPER_ADMIN');
            router.push('/dashboard');
            setRedirectAttempts(prev => prev + 1);
          }
          return;
        }
        
        // User is not authenticated, show login/register content
        console.log("AuthRedirect: User not authenticated, showing login content");
        setIsLoading(false);
      } catch (error) {
        console.error("AuthRedirect error:", error);
        // On error, show login content
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router, pathname, redirectAttempts]);

  // Force show content after 2 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("AuthRedirect: Force showing content after timeout");
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Redirection...</span>
      </div>
    );
  }

  return <>{children}</>;
}
