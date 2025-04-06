import { apiClient } from './api-client';

// Define the tenant interface
export interface Tenant {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    clients: number;
    declarations: number;
    livres: number;
  };
}

// Define the create tenant DTO
export interface CreateTenantDto {
  name: string;
  description?: string;
}

// Define the update tenant DTO
export interface UpdateTenantDto {
  name?: string;
  description?: string;
}

// Tenant API functions
export const tenantsApi = {
  // Get all tenants
  getAll: async (): Promise<Tenant[]> => {
    try {
      return await apiClient.get<Tenant[]>('admin/tenants');
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },
  
  // Get tenant by ID
  getById: async (id: string): Promise<Tenant> => {
    try {
      return await apiClient.get<Tenant>(`admin/tenants/${id}`);
    } catch (error) {
      console.error(`Error fetching tenant with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new tenant
  create: async (data: CreateTenantDto): Promise<Tenant> => {
    try {
      console.log('Creating tenant with data:', data);
      
      // Convert the DTO to a Record<string, unknown> to satisfy TypeScript
      const requestData: Record<string, unknown> = {
        name: data.name,
        description: data.description
      };
      
      const createdTenant = await apiClient.post<Tenant>('admin/tenants', requestData);
      
      console.log('Created tenant:', createdTenant);
      return createdTenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  },
  
  // Update a tenant
  update: async (id: string, data: UpdateTenantDto): Promise<Tenant> => {
    try {
      return await apiClient.patch<Tenant, UpdateTenantDto>(`admin/tenants/${id}`, data);
    } catch (error) {
      console.error(`Error updating tenant with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a tenant
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`admin/tenants/${id}`);
    } catch (error) {
      console.error(`Error deleting tenant with ID ${id}:`, error);
      throw error;
    }
  },
};
