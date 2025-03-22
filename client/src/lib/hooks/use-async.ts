import { useState, useCallback, useEffect } from 'react';
import { useApiError } from './use-api-error';

interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: ReturnType<typeof useApiError>['error'];
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling async operations with loading and error states
 * @param asyncFunction The async function to execute
 * @param immediate Whether to execute the function immediately
 * @param initialData Initial data value
 * @returns Object with data, loading, error states and execute/reset functions
 */
export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = false,
  initialData: T | null = null
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const { error, setError, clearError } = useApiError();

  // Function to execute the async function
  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      try {
        setLoading(true);
        clearError();
        
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (error) {
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, clearError, setError]
  );

  // Reset all state
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    clearError();
  }, [initialData, clearError]);

  // Execute the function immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, execute, reset };
}
