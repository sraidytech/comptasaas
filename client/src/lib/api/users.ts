import { apiClient } from './api-client';

// Define the user interface
export interface User {
  id: string;
  tenantId?: string;
  roleId: string;
  username: string;
  email: string;
  imageUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Include role and tenant information
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
}

// Define the create user DTO
export interface CreateUserDto {
  tenantId?: string;
  roleId: string;
  username: string;
  email: string;
  password: string;
  imageUrl?: string;
  isActive?: boolean;
}

// Define the update user DTO
export interface UpdateUserDto {
  tenantId?: string;
  roleId?: string;
  username?: string;
  email?: string;
  password?: string;
  imageUrl?: string;
  isActive?: boolean;
}

// Password change DTO
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Status update DTO
export interface UpdateStatusDto {
  isActive: boolean;
}

// User API functions
export const usersApi = {
  // Get all users (for super admin)
  getAll: async (): Promise<User[]> => {
    try {
      return await apiClient.get<User[]>('admin/users');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Get users by tenant ID (for tenant admin)
  getByTenant: async (tenantId: string): Promise<User[]> => {
    try {
      return await apiClient.get<User[]>(`admin/tenants/${tenantId}/users`);
    } catch (error) {
      console.error(`Error fetching users for tenant ${tenantId}:`, error);
      throw error;
    }
  },
  
  // Get user by ID
  getById: async (id: string): Promise<User> => {
    try {
      return await apiClient.get<User>(`admin/users/${id}`);
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new user
  create: async (data: CreateUserDto): Promise<User> => {
    try {
      console.log('Creating user with data:', data);
      
      // Convert the DTO to a Record<string, unknown> to satisfy TypeScript
      const requestData: Record<string, unknown> = {
        tenantId: data.tenantId,
        roleId: data.roleId,
        username: data.username,
        email: data.email,
        password: data.password,
        imageUrl: data.imageUrl,
        isActive: data.isActive
      };
      
      const createdUser = await apiClient.post<User>('admin/users', requestData);
      
      console.log('Created user:', createdUser);
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  },
  
  // Update a user
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    try {
      return await apiClient.patch<User, UpdateUserDto>(`admin/users/${id}`, data);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a user
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`admin/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Change user password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post<void, ChangePasswordDto>(`admin/users/${id}/change-password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error(`Error changing password for user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Activate or deactivate a user
  setActiveStatus: async (id: string, isActive: boolean): Promise<User> => {
    try {
      return await apiClient.patch<User, UpdateStatusDto>(`admin/users/${id}/status`, { isActive });
    } catch (error) {
      console.error(`Error changing status for user with ID ${id}:`, error);
      throw error;
    }
  },
};
