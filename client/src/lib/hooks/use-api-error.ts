import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

interface UseApiErrorResult {
  error: ApiError | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasFieldError: (fieldName: string) => boolean;
}

/**
 * Custom hook for handling API errors
 * @returns Object with error state and helper functions
 */
export function useApiError(): UseApiErrorResult {
  const [error, setErrorState] = useState<ApiError | null>(null);

  // Parse and set error from API response
  const setError = useCallback((error: unknown) => {
    if (error instanceof AxiosError) {
      const apiError: ApiError = {
        message: 'Une erreur est survenue',
        statusCode: error.response?.status,
      };

      // Handle different error responses
      if (error.response?.data) {
        const data = error.response.data;
        
        // Handle NestJS validation errors
        if (data.message && Array.isArray(data.message)) {
          apiError.message = 'Veuillez corriger les erreurs suivantes:';
          apiError.errors = {};
          
          // Define a type for NestJS validation errors
          interface NestValidationError {
            property: string;
            constraints?: Record<string, string>;
          }
          
          data.message.forEach((validationError: NestValidationError) => {
            const field = validationError.property;
            const constraints = Object.values(validationError.constraints || {});
            
            if (field && constraints.length > 0) {
              apiError.errors = apiError.errors || {};
              apiError.errors[field] = constraints as string[];
            }
          });
        } 
        // Handle standard error message
        else if (data.message) {
          apiError.message = data.message;
        }
        
        // Handle field errors object
        if (data.errors && typeof data.errors === 'object') {
          apiError.errors = data.errors;
        }
      }

      setErrorState(apiError);
      
      // Show toast for non-validation errors
      if (!apiError.errors || Object.keys(apiError.errors).length === 0) {
        toast.error(apiError.message);
      }
    } else if (error instanceof Error) {
      setErrorState({ message: error.message });
      toast.error(error.message);
    } else {
      setErrorState({ message: 'Une erreur inconnue est survenue' });
      toast.error('Une erreur inconnue est survenue');
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Get error message for a specific field
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      if (!error?.errors || !error.errors[fieldName]) {
        return undefined;
      }
      
      return error.errors[fieldName][0];
    },
    [error]
  );

  // Check if a field has an error
  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      return !!getFieldError(fieldName);
    },
    [getFieldError]
  );

  return {
    error,
    setError,
    clearError,
    getFieldError,
    hasFieldError,
  };
}
