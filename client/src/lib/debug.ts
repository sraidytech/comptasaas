'use client';

// Debug utility for the application
// This file contains functions for debugging purposes

// Enable or disable debug mode
let debugEnabled = false;

// Initialize debug mode
export function initDebug(enabled: boolean = false): void {
  debugEnabled = enabled;
  if (debugEnabled) {
    console.log('Debug mode enabled');
  }
}

// Log debug message
export function debug(message: string, ...args: unknown[]): void {
  if (debugEnabled) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

// Log debug error
export function debugError(message: string, error: unknown): void {
  if (debugEnabled) {
    console.error(`[DEBUG ERROR] ${message}`, error);
  }
}

// Log authentication debug info
export function debugAuth(message: string, ...args: unknown[]): void {
  if (debugEnabled) {
    console.log(`[DEBUG AUTH] ${message}`, ...args);
  }
}

// Log API request
export function logApiRequest(
  method: string,
  url: string,
  data?: unknown,
  headers?: Record<string, string>
): void {
  if (debugEnabled) {
    console.log(`[API REQUEST] ${method} ${url}`, {
      headers: headers ? { ...headers, Authorization: headers.Authorization ? '***' : undefined } : undefined,
      data,
    });
  }
}

// Log API response
export function logApiResponse(
  method: string,
  url: string,
  status: number,
  data?: unknown
): void {
  if (debugEnabled) {
    console.log(`[API RESPONSE] ${method} ${url} (${status})`, data);
  }
}

// Log API error
export function logApiError(
  method: string,
  url: string,
  error: unknown
): void {
  if (debugEnabled) {
    console.error(`[API ERROR] ${method} ${url}`, error);
  }
}

// Get localStorage item with debug info
export function debugGetItem(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    if (debugEnabled) {
      console.log(`[DEBUG] localStorage.getItem('${key}') =`, value);
    }
    return value;
  } catch (error) {
    if (debugEnabled) {
      console.error(`[DEBUG] Error getting localStorage item '${key}':`, error);
    }
    return null;
  }
}

// Set localStorage item with debug info
export function debugSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    if (debugEnabled) {
      console.log(`[DEBUG] localStorage.setItem('${key}', '${value}')`);
    }
  } catch (error) {
    if (debugEnabled) {
      console.error(`[DEBUG] Error setting localStorage item '${key}':`, error);
    }
  }
}

// Remove localStorage item with debug info
export function debugRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
    if (debugEnabled) {
      console.log(`[DEBUG] localStorage.removeItem('${key}')`);
    }
  } catch (error) {
    if (debugEnabled) {
      console.error(`[DEBUG] Error removing localStorage item '${key}':`, error);
    }
  }
}

// Dump all localStorage items
export function debugDumpLocalStorage(): void {
  if (!debugEnabled) return;
  
  try {
    console.log('[DEBUG] localStorage dump:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`  ${key} =`, value);
      }
    }
  } catch (error) {
    console.error('[DEBUG] Error dumping localStorage:', error);
  }
}
