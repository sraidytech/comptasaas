'use client';

import axios from 'axios';
import { getAccessToken } from '@/lib/auth';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginFormData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  tenantId?: string;
}

export async function login(formData: LoginFormData): Promise<{
  user: UserData;
  accessToken: string;
  refreshToken: string;
}> {
  try {
    console.log('Attempting to login with:', formData.email);
    
    // Try to authenticate with the real API
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: formData.email,
      password: formData.password
    });
    
    // Extract data from response
    const { user, access_token, refresh_token } = response.data;
    
    console.log('API login successful:', user);
    
    return {
      user,
      accessToken: access_token,
      refreshToken: refresh_token
    };
  } catch (error) {
    console.error('API login failed:', error);
    
    // Check for specific error messages from the API
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response) {
      const responseData = error.response.data as { message?: string };
      
      // Check for tenant inactive message
      if (responseData.message && responseData.message.includes('Tenant account is inactive')) {
        throw new Error('Tenant account is inactive');
      }
      
      // Check for user inactive message
      if (responseData.message && responseData.message.includes('User account is inactive')) {
        throw new Error('User account is inactive');
      }
      
      // If there's a message in the response, use it
      if (responseData.message) {
        throw new Error(responseData.message);
      }
    }
    
    // Fallback to mock implementation for development/testing
    
    // Fallback to mock implementation for development/testing
    // Check if the user is the super admin
    const isSuperAdmin = formData.email === 'sracomconnect@gmail.com' && 
                         formData.password === 'SracomConnect@2025Sr';
    
    if (!isSuperAdmin) {
      console.error('Invalid credentials for mock login');
      throw new Error('Identifiants invalides');
    }
    
    // Create user data
    const user = {
      id: '1',
      email: formData.email,
      username: formData.email.split('@')[0],
      role: 'SUPER_ADMIN',
      tenantId: undefined,
    };
    
    // Generate mock tokens with longer expiration
    // In a real implementation, these would be proper JWT tokens
    const accessToken = `mock_access_token_${Date.now()}_expires_in_15m`;
    const refreshToken = `mock_refresh_token_${Date.now()}_expires_in_7d`;
    
    console.log('Mock login successful:', user);
    
    return {
      user,
      accessToken,
      refreshToken
    };
  }
}

export async function refreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  try {
    console.log('Attempting to refresh token');
    
    // Try to refresh token with the real API
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: refreshToken
    });
    
    // Extract tokens from response
    const { access_token, refresh_token } = response.data;
    
    console.log('Token refresh successful');
    
    return {
      accessToken: access_token,
      refreshToken: refresh_token
    };
  } catch (error) {
    console.error('API token refresh failed, generating mock tokens:', error);
    
    // Generate mock tokens for development/testing
    const accessToken = `mock_access_token_${Date.now()}_refreshed`;
    const newRefreshToken = `mock_refresh_token_${Date.now()}_refreshed`;
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
}

export async function logout(): Promise<void> {
  console.log('Logging out...');
  
  try {
    const token = getAccessToken();
    
    // Try to call the real API logout endpoint
    if (token) {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('API logout successful');
    } else {
      console.warn('No access token available for logout');
    }
  } catch (error) {
    console.error('API logout failed:', error);
    // Continue with client-side logout even if API call fails
  }
  
  // Client-side logout is handled by the component that calls this function
  console.log('Client-side logout complete');
}
