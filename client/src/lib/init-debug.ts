'use client';

import { initDebug, debugDumpLocalStorage } from './debug';
import { initAuthDebug, logAuthState } from './auth-debug';

// Initialize debug mode
export function initializeDebug(): void {
  // Enable debug mode in development environment
  const isDevEnvironment = process.env.NODE_ENV === 'development';
  
  // Initialize debug mode
  initDebug(isDevEnvironment);
  
  // Initialize auth debugging
  initAuthDebug();
  
  // Dump localStorage contents if in development
  if (isDevEnvironment) {
    try {
      debugDumpLocalStorage();
      
      // Log initial auth state
      logAuthState();
    } catch (error) {
      console.error('Error initializing debug:', error);
    }
  }
}
