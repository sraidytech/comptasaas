import { apiClient } from './api-client';

// Define the livre type interface
export interface LivreType {
  id: string;
  name: string;
  description?: string;
  articles?: string;
  createdAt: string;
  updatedAt: string;
  months?: LivreMonth[];
}

// Define the livre month interface
export interface LivreMonth {
  id: string;
  month: number; // 1-12
  livreTypeId: string;
}

// Define the create livre type DTO
export interface CreateLivreTypeDto {
  name: string;
  description?: string;
  articles?: string;
  months?: number[]; // Array of months (1-12)
}

// Define the update livre type DTO
export interface UpdateLivreTypeDto {
  name?: string;
  description?: string;
  articles?: string;
}

// Livre Type API functions
export const livreTypesApi = {
  // Get all livre types
  getAll: async (): Promise<LivreType[]> => {
    try {
      return await apiClient.get<LivreType[]>('admin/livre-types');
    } catch (error) {
      console.error('Error fetching livre types:', error);
      throw error;
    }
  },
  
  // Get livre type by ID
  getById: async (id: string): Promise<LivreType> => {
    try {
      return await apiClient.get<LivreType>(`admin/livre-types/${id}`);
    } catch (error) {
      console.error(`Error fetching livre type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new livre type
  create: async (data: CreateLivreTypeDto): Promise<LivreType> => {
    try {
      // Extract months from the data to match the backend controller's expectation
      const { months, ...livreTypeData } = data;
      
      // First create the livre type without months
      const createdType = await apiClient.post<LivreType>('admin/livre-types', livreTypeData);
      
      // If months are provided, add them in a separate request
      if (months && months.length > 0) {
        return await apiClient.post<LivreType>(`admin/livre-types/${createdType.id}/months`, { months });
      }
      
      return createdType;
    } catch (error) {
      console.error('Error creating livre type:', error);
      throw error;
    }
  },
  
  // Update a livre type
  update: async (id: string, data: UpdateLivreTypeDto): Promise<LivreType> => {
    try {
      return await apiClient.patch<LivreType, UpdateLivreTypeDto>(`admin/livre-types/${id}`, data);
    } catch (error) {
      console.error(`Error updating livre type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a livre type
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`admin/livre-types/${id}`);
    } catch (error) {
      console.error(`Error deleting livre type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Add months to a livre type
  addMonths: async (id: string, months: number[]): Promise<LivreType> => {
    try {
      return await apiClient.post<LivreType, { months: number[] }>(
        `admin/livre-types/${id}/months`,
        { months }
      );
    } catch (error) {
      console.error(`Error adding months to livre type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Remove months from a livre type
  removeMonths: async (id: string, months: number[]): Promise<LivreType> => {
    try {
      return await apiClient.delete<LivreType>(
        `admin/livre-types/${id}/months`,
        { data: { months } }
      );
    } catch (error) {
      console.error(`Error removing months from livre type with ID ${id}:`, error);
      throw error;
    }
  },
};
