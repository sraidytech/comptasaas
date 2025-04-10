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

// Define the paginated users response interface
export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Define the filter users DTO
export interface FilterUsersDto {
  tenantId?: string;
  roleId?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
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
  getAll: async (filters?: FilterUsersDto): Promise<User[] | PaginatedUsersResponse> => {
    try {
      if (!filters) {
        return await apiClient.get<User[]>('admin/users');
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.tenantId) params.append('tenantId', filters.tenantId);
      if (filters.roleId) params.append('roleId', filters.roleId);
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
      if (filters.page !== undefined) params.append('page', String(filters.page));
      if (filters.pageSize !== undefined) params.append('pageSize', String(filters.pageSize));
      
      const queryString = params.toString();
      const url = queryString ? `admin/users?${queryString}` : 'admin/users';
      
      return await apiClient.get<PaginatedUsersResponse>(url);
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
      // Use the users endpoint for all user operations
      return await apiClient.get<User>(`users/${id}`);
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
      
      // Use the admin/users endpoint for creating users from the admin panel
      // This ensures the AdminUsersController is used which has the logic to create tenants for admin users
      const endpoint = 'admin/users';
      
      const createdUser = await apiClient.post<User>(endpoint, requestData);
      
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
      // Use the users endpoint for all user operations
      return await apiClient.patch<User, UpdateUserDto>(`users/${id}`, data);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a user
  delete: async (id: string): Promise<void> => {
    try {
      // Use the users endpoint for all user operations
      await apiClient.delete<void>(`users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Change user password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // Use the users endpoint for all user operations
      await apiClient.post<void, ChangePasswordDto>(`users/${id}/change-password`, {
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
      // Use the admin/users endpoint for status operations
      return await apiClient.patch<User, UpdateStatusDto>(`admin/users/${id}/status`, { isActive });
    } catch (error) {
      console.error(`Error changing status for user with ID ${id}:`, error);
      throw error;
    }
  },
};
