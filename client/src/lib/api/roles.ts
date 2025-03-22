import { apiClient } from './api-client';

// Define the role interface
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

// Define the permission interface
export interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

// Define the create role DTO
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
}

// Define the update role DTO
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Role API functions
export const rolesApi = {
  // Get all roles
  getAll: async (): Promise<Role[]> => {
    try {
      return await apiClient.get<Role[]>('admin/roles');
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },
  
  // Get role by ID
  getById: async (id: string): Promise<Role> => {
    try {
      return await apiClient.get<Role>(`admin/roles/${id}`);
    } catch (error) {
      console.error(`Error fetching role with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new role
  create: async (data: CreateRoleDto): Promise<Role> => {
    try {
      return await apiClient.post<Role, CreateRoleDto>('admin/roles', data);
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },
  
  // Update a role
  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    try {
      return await apiClient.patch<Role, UpdateRoleDto>(`admin/roles/${id}`, data);
    } catch (error) {
      console.error(`Error updating role with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a role
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`admin/roles/${id}`);
    } catch (error) {
      console.error(`Error deleting role with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get all permissions
  getAllPermissions: async (): Promise<Permission[]> => {
    try {
      return await apiClient.get<Permission[]>('admin/permissions');
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },
  
  // Add permissions to a role
  addPermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    try {
      return await apiClient.post<Role, { permissionIds: string[] }>(
        `admin/roles/${roleId}/permissions`,
        { permissionIds }
      );
    } catch (error) {
      console.error(`Error adding permissions to role with ID ${roleId}:`, error);
      throw error;
    }
  },
  
  // Remove permissions from a role
  removePermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    try {
      return await apiClient.delete<Role>(
        `admin/roles/${roleId}/permissions`,
        { data: { permissionIds } }
      );
    } catch (error) {
      console.error(`Error removing permissions from role with ID ${roleId}:`, error);
      throw error;
    }
  },
};
