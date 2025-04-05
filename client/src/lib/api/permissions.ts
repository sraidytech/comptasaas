import { apiClient } from './api-client';

// Define the role interface for permissions
export interface PermissionRole {
  id: string;
  name: string;
}

// Define the permission interface
export interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: PermissionRole[];
}

// Permissions API functions
export const permissionsApi = {
  // Get all permissions
  getAll: async (): Promise<Permission[]> => {
    try {
      return await apiClient.get<Permission[]>('admin/permissions');
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },
  
  // Get permission by ID
  getById: async (id: string): Promise<Permission> => {
    try {
      return await apiClient.get<Permission>(`admin/permissions/${id}`);
    } catch (error) {
      console.error(`Error fetching permission with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get permissions for a role
  getRolePermissions: async (roleId: string): Promise<Permission[]> => {
    try {
      return await apiClient.get<Permission[]>(`admin/roles/${roleId}/permissions`);
    } catch (error) {
      console.error(`Error fetching permissions for role ${roleId}:`, error);
      throw error;
    }
  },
};
