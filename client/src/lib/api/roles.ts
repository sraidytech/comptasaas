import { apiClient } from './api-client';
import { Permission } from './permissions';

// Define the role interface
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
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
      
      // Extract permissionIds from the data to handle them separately
      const { permissionIds, ...roleData } = data;
      
      // First create the role without permissions
      const createdRole = await apiClient.post<Role>('admin/roles', roleData);
      
      console.log('Created role:', createdRole);
      
      // If permissionIds are provided, add them to the role
      if (permissionIds && permissionIds.length > 0) {
        console.log('Adding permissions to role:', permissionIds);
        
        try {
          // Add permissions to the role
          await apiClient.post<Role>(`admin/roles/${createdRole.id}/permissions`, {
            permissionIds
          });
          
          // Get the updated role with permissions
          const updatedRole = await apiClient.get<Role>(`admin/roles/${createdRole.id}`);
          return updatedRole;
        } catch (permissionError) {
          console.error('Error adding permissions to role:', permissionError);
          console.warn('Role was created but permissions could not be added');
          
          // Return the created role even if adding permissions failed
          return createdRole;
        }
      }
      
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
      const updatedRole = await apiClient.patch<Role, UpdateRoleDto>(`admin/roles/${id}`, data);
      
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
