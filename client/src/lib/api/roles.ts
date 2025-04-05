import { apiClient } from './api-client';
import { Permission } from './permissions';

// Define the role permission interface
export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

// Define the role interface
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  rolePermissions?: RolePermission[];
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
      console.log('Creating role with data:', data);
      
      // Send the complete data including permissionIds to the backend
      // Use object spread to create a new object that TypeScript will accept
      const createdRole = await apiClient.post<Role>('admin/roles', { ...data });
      
      console.log('Created role:', createdRole);
      return createdRole;
    } catch (error) {
      console.error('Error creating role:', error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  },
  
  // Update a role
  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    try {
      console.log('Updating role with data:', data);
      
      // Update the role
      // Use object spread to create a new object that TypeScript will accept
      const updatedRole = await apiClient.patch<Role>(`admin/roles/${id}`, { ...data });
      
      console.log('Updated role:', updatedRole);
      
      return updatedRole;
    } catch (error) {
      console.error(`Error updating role with ID ${id}:`, error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
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
      console.log(`Adding permissions to role ${roleId}:`, permissionIds);
      
      const updatedRole = await apiClient.post<Role, { permissionIds: string[] }>(
        `admin/roles/${roleId}/permissions`,
        { permissionIds }
      );
      
      console.log('Role after adding permissions:', updatedRole);
      return updatedRole;
    } catch (error) {
      console.error(`Error adding permissions to role with ID ${roleId}:`, error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  },
  
  // Remove permissions from a role
  removePermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    try {
      console.log(`Removing permissions from role ${roleId}:`, permissionIds);
      
      const updatedRole = await apiClient.delete<Role>(
        `admin/roles/${roleId}/permissions`,
        { data: { permissionIds } }
      );
      
      console.log('Role after removing permissions:', updatedRole);
      return updatedRole;
    } catch (error) {
      console.error(`Error removing permissions from role with ID ${roleId}:`, error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  },
};
