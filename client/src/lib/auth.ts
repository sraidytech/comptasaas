// Authentication logic for the application
import { debugGetItem, debugSetItem, debugRemoveItem, debugAuth, debugError } from './debug';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  tenantId?: string | null;
}

// Get the current user from localStorage
export function getCurrentUser(): User | null {
  try {
    // In a real app, you would get this from a secure cookie or token
    const userJson = typeof window !== 'undefined' ? debugGetItem('user') : null;
    
    if (!userJson) {
      debugAuth('getCurrentUser: No user found in localStorage');
      return null;
    }
    
    const user = JSON.parse(userJson) as User;
    debugAuth('getCurrentUser: User found', user);
    return user;
  } catch (error) {
    debugError('Error parsing user data:', error);
    return null;
  }
}

// Check if the current user is a super admin
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  const result = user?.role === 'SUPER_ADMIN';
  debugAuth(`isSuperAdmin: ${result}`, user);
  return result;
}

// Check if the current user is an admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  const result = user?.role === 'ADMIN';
  debugAuth(`isAdmin: ${result}`, user);
  return result;
}

// Check if the current user is a team manager
export function isTeamManager(): boolean {
  const user = getCurrentUser();
  const result = user?.role === 'TEAM_MANAGER';
  debugAuth(`isTeamManager: ${result}`, user);
  return result;
}

// Check if the current user is an employee
export function isEmployee(): boolean {
  const user = getCurrentUser();
  const result = user?.role === 'EMPLOYEE';
  debugAuth(`isEmployee: ${result}`, user);
  return result;
}

// Get the user's role
export function getUserRole(): string | null {
  const user = getCurrentUser();
  const role = user?.role || null;
  debugAuth(`getUserRole: ${role}`, user);
  return role;
}

// Get the access token from localStorage
export function getAccessToken(): string | null {
  try {
    const token = typeof window !== 'undefined' ? debugGetItem('accessToken') : null;
    debugAuth(`getAccessToken: ${token ? 'Token found' : 'No token found'}`);
    return token;
  } catch (error) {
    debugError('Error getting access token:', error);
    return null;
  }
}

// Get the refresh token from localStorage
export function getRefreshToken(): string | null {
  try {
    const token = typeof window !== 'undefined' ? debugGetItem('refreshToken') : null;
    debugAuth(`getRefreshToken: ${token ? 'Token found' : 'No token found'}`);
    return token;
  } catch (error) {
    debugError('Error getting refresh token:', error);
    return null;
  }
}

// Store authentication data in localStorage
export function storeAuthData(user: User, accessToken: string, refreshToken: string): void {
  try {
    debugAuth('storeAuthData: Storing authentication data', { user, accessToken: accessToken.substring(0, 10) + '...', refreshToken: refreshToken.substring(0, 10) + '...' });
    debugSetItem('user', JSON.stringify(user));
    debugSetItem('accessToken', accessToken);
    debugSetItem('refreshToken', refreshToken);
  } catch (error) {
    debugError('Error storing authentication data:', error);
  }
}

// Clear authentication data from localStorage
export function clearAuthData(): void {
  try {
    debugAuth('clearAuthData: Clearing authentication data');
    debugRemoveItem('user');
    debugRemoveItem('accessToken');
    debugRemoveItem('refreshToken');
  } catch (error) {
    debugError('Error clearing authentication data:', error);
  }
}

// Check if the user is authenticated
export function isAuthenticated(): boolean {
  try {
    const hasToken = !!getAccessToken();
    const hasUser = !!getCurrentUser();
    const result = hasToken && hasUser;
    debugAuth(`isAuthenticated: ${result}`, { hasToken, hasUser });
    return result;
  } catch (error) {
    debugError('Error checking authentication:', error);
    return false;
  }
}
