import { apiClient } from './api-client';

// Define subscription plan enum
export enum SubscriptionPlan {
  NONE = 'NONE',
  SIX_MONTHS = 'SIX_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
}

// Define payment status enum
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
}

// Define payment method enum
export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// Define the tenant interface
export interface Tenant {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
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
  isActive?: boolean;
}

// Define the update tenant DTO
export interface UpdateTenantDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Define the update tenant status DTO
export interface UpdateTenantStatusDto {
  isActive: boolean;
  password: string;
}

// Define the update tenant subscription DTO
export interface UpdateTenantSubscriptionDto {
  subscriptionPlan: SubscriptionPlan;
  subscriptionStart: string;
  subscriptionEnd: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  password: string;
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
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true
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
  
  // Update tenant status with password confirmation
  updateStatus: async (id: string, data: UpdateTenantStatusDto): Promise<Tenant> => {
    try {
      return await apiClient.patch<Tenant, UpdateTenantStatusDto>(`admin/tenants/${id}/status`, data);
    } catch (error) {
      console.error(`Error updating tenant status with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Update tenant subscription with password confirmation
  updateSubscription: async (id: string, data: UpdateTenantSubscriptionDto): Promise<Tenant> => {
    try {
      return await apiClient.patch<Tenant, UpdateTenantSubscriptionDto>(`admin/tenants/${id}/subscription`, data);
    } catch (error) {
      console.error(`Error updating tenant subscription with ID ${id}:`, error);
      throw error;
    }
  },
};
