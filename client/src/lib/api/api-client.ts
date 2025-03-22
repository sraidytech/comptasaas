import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, storeAuthData, clearAuthData, getCurrentUser } from '@/lib/auth';
import { logApiRequest, logApiResponse, logApiError } from '@/lib/debug';

// Define the base URL for API requests
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Remove trailing '/api' if it exists to avoid double '/api' in URLs
if (API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.slice(0, -4);
  console.log('Removed trailing /api from API_BASE_URL:', API_BASE_URL);
}

// The NestJS server already has a global prefix 'api' set in main.ts
const API_PREFIX = '/api';

// Create a class for the API client
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Increase timeout to handle slow connections
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  // Subscribe to token refresh
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // Notify subscribers that token has been refreshed
  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private setupInterceptors(): void {
    // Request interceptor to include auth token
    this.instance.interceptors.request.use(
      (config) => {
        // Get token using our auth helper
        const token = getAccessToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If we're already refreshing, wait for the new token
            return new Promise<AxiosResponse>((resolve) => {
              this.subscribeTokenRefresh((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;
          
          try {
            // Get refresh token using our auth helper
            const refreshToken = getRefreshToken();
            
            if (!refreshToken) {
              // Redirect to login if no refresh token
              console.error('No refresh token available');
              clearAuthData();
              window.location.href = '/login';
              return Promise.reject(error);
            }
            
            // Call refresh token endpoint
            console.log('Attempting to refresh token');
            const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
              refresh_token: refreshToken,
            });
            
            // Extract tokens
            const { access_token, refresh_token } = response.data;
            
            // Get current user data
            const user = getCurrentUser();
            if (!user) {
              console.error('No user data available');
              clearAuthData();
              window.location.href = '/login';
              return Promise.reject(error);
            }
            
            console.log('Token refreshed successfully');
            
            // Store updated tokens
            storeAuthData(user, access_token, refresh_token);
            
            // Notify subscribers that token has been refreshed
            this.onTokenRefreshed(access_token);
            this.isRefreshing = false;
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // If refresh token is invalid, clear auth data and redirect to login
            console.error('Token refresh failed:', refreshError);
            this.isRefreshing = false;
            clearAuthData();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        // For other errors, just reject the promise
        return Promise.reject(error);
      }
    );
  }

  // Helper to ensure URL has the correct API prefix
  private ensureApiPrefix(url: string): string {
    // If the URL already starts with the API prefix, return it as is
    if (url.startsWith(API_PREFIX)) {
      return url;
    }
    
    // Otherwise, add the API prefix
    return `${API_PREFIX}/${url}`;
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      // Ensure the URL has the correct API prefix
      if (config.url) {
        config.url = this.ensureApiPrefix(config.url);
      }
      
      // Log the request
      logApiRequest(
        config.method?.toUpperCase() || 'GET',
        `${this.instance.defaults.baseURL}${config.url}`,
        config.data,
        config.headers as Record<string, string>
      );
      
      // Make the request
      const response: AxiosResponse<T> = await this.instance.request(config);
      
      // Log the response
      logApiResponse(
        config.method?.toUpperCase() || 'GET',
        `${this.instance.defaults.baseURL}${config.url}`,
        response.status,
        response.data
      );
      
      return response.data;
    } catch (error) {
      // Log the error
      logApiError(
        config.method?.toUpperCase() || 'GET',
        `${this.instance.defaults.baseURL}${config.url}`,
        error
      );
      throw error;
    }
  }

  // GET method
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'get', url });
  }

  // POST method
  public async post<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'post', url, data });
  }

  // PUT method
  public async put<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'put', url, data });
  }

  // PATCH method
  public async patch<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'patch', url, data });
  }

  // DELETE method
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'delete', url });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(`${API_BASE_URL}`);

// Log the base URL for debugging
console.log('API Base URL:', API_BASE_URL);
