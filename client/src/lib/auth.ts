// This is a placeholder for actual authentication logic
// In a real application, this would interact with your backend API

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  tenantId?: string;
}

// Mock function to get the current user from localStorage or cookies
export function getCurrentUser(): User | null {
  // In a real app, you would get this from a secure cookie or token
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

// Check if the current user is a super admin
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'SUPER_ADMIN';
}

// Check if the current user is an admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}

// Check if the current user is a team manager
export function isTeamManager(): boolean {
  const user = getCurrentUser();
  return user?.role === 'TEAM_MANAGER';
}

// Check if the current user is an employee
export function isEmployee(): boolean {
  const user = getCurrentUser();
  return user?.role === 'EMPLOYEE';
}

// Get the user's role
export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}
