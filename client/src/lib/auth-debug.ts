'use client';

import { debugDumpLocalStorage } from './debug';

/**
 * Auth debugging utility
 * This file contains functions for debugging authentication issues
 */

// Log authentication state
export function logAuthState(): void {
  console.group('Authentication State');
  
  try {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      // Get auth data from localStorage
      const user = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Log auth data
      console.log('User:', user ? JSON.parse(user) : null);
      console.log('Access Token:', accessToken ? `${accessToken.substring(0, 10)}...` : null);
      console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : null);
      console.log('Has Access Token:', !!accessToken);
      console.log('Has Refresh Token:', !!refreshToken);
      
      // Dump all localStorage items
      debugDumpLocalStorage();
    } else {
      console.log('localStorage not available (server-side rendering)');
    }
  } catch (error) {
    console.error('Error logging auth state:', error);
  }
  
  console.groupEnd();
}

// Check token expiration
export function checkTokenExpiration(): void {
  console.group('Token Expiration Check');
  
  try {
    // Get tokens from localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken && !refreshToken) {
      console.log('No tokens found');
      console.groupEnd();
      return;
    }
    
    // For real JWT tokens, you would decode and check the exp claim
    // For mock tokens, we'll check if they contain expiration info
    
    if (accessToken) {
      console.log('Access Token:', accessToken);
      
      if (accessToken.includes('expires_in')) {
        const mockExpiration = accessToken.split('_expires_in_')[1];
        console.log('Mock expiration:', mockExpiration);
      } else if (accessToken.includes('refreshed')) {
        console.log('Token has been refreshed');
      }
    }
    
    if (refreshToken) {
      console.log('Refresh Token:', refreshToken);
      
      if (refreshToken.includes('expires_in')) {
        const mockExpiration = refreshToken.split('_expires_in_')[1];
        console.log('Mock expiration:', mockExpiration);
      } else if (refreshToken.includes('refreshed')) {
        console.log('Token has been refreshed');
      }
    }
  } catch (error) {
    console.error('Error checking token expiration:', error);
  }
  
  console.groupEnd();
}

// Log redirection history
const redirectionHistory: Array<{
  timestamp: string;
  from: string;
  to: string;
  reason: string;
}> = [];

export function logRedirection(from: string, to: string, reason: string): void {
  const timestamp = new Date().toISOString();
  
  // Add to history
  redirectionHistory.push({
    timestamp,
    from,
    to,
    reason,
  });
  
  // Log redirection
  console.log(`[REDIRECTION] ${timestamp} - ${from} → ${to} (${reason})`);
  
  // Limit history size
  if (redirectionHistory.length > 20) {
    redirectionHistory.shift();
  }
}

export function getRedirectionHistory(): typeof redirectionHistory {
  return [...redirectionHistory];
}

export function clearRedirectionHistory(): void {
  redirectionHistory.length = 0;
}

// Define auth debug interface
interface AuthDebugInterface {
  logAuthState: typeof logAuthState;
  checkTokenExpiration: typeof checkTokenExpiration;
  getRedirectionHistory: typeof getRedirectionHistory;
  clearRedirectionHistory: typeof clearRedirectionHistory;
}

// Declare global window property
declare global {
  interface Window {
    authDebug?: AuthDebugInterface;
  }
}

// Initialize auth debugging
export function initAuthDebug(): void {
  // Add auth debugging to window for console access
  if (typeof window !== 'undefined') {
    window.authDebug = {
      logAuthState,
      checkTokenExpiration,
      getRedirectionHistory,
      clearRedirectionHistory,
    };
    
    console.log('Auth debugging initialized. Access via window.authDebug in console.');
  }
}
