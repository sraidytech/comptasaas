'use client';

import { useEffect } from 'react';
import { initDebug, debugDumpLocalStorage } from '@/lib/debug';
import { initAuthDebug, logAuthState } from '@/lib/auth-debug';

// Debug initializer component
// This component initializes debugging when mounted
export function DebugInitializer() {
  useEffect(() => {
    // Force enable debug mode regardless of environment
    initDebug(true);
    
    // Initialize auth debugging
    initAuthDebug();
    
    // Dump localStorage contents
    try {
      debugDumpLocalStorage();
      
      // Log initial auth state
      logAuthState();
      
      console.log('Debug mode forcefully enabled for API troubleshooting');
    } catch (error) {
      console.error('Error initializing debug:', error);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
