import { apiClient } from './api-client';

// Define the declaration type interface
export interface DeclarationType {
  id: string;
  name: string;
  description?: string;
  articles?: string;
  createdAt: string;
  updatedAt: string;
  months?: DeclarationMonth[];
}

// Define the declaration month interface
export interface DeclarationMonth {
  id: string;
  month: number; // 1-12
  declarationTypeId: string;
}

// Define the create declaration type DTO
export interface CreateDeclarationTypeDto {
  name: string;
  description?: string;
  articles?: string;
  months?: number[]; // Array of months (1-12)
}

// Define the update declaration type DTO
export interface UpdateDeclarationTypeDto {
  name?: string;
  description?: string;
  articles?: string;
}

// Declaration Type API functions
export const declarationTypesApi = {
  // Get all declaration types
  getAll: async (): Promise<DeclarationType[]> => {
    try {
      return await apiClient.get<DeclarationType[]>('admin/declaration-types');
    } catch (error) {
      console.error('Error fetching declaration types:', error);
      throw error;
    }
  },
  
  // Get declaration type by ID
  getById: async (id: string): Promise<DeclarationType> => {
    try {
      return await apiClient.get<DeclarationType>(`admin/declaration-types/${id}`);
    } catch (error) {
      console.error(`Error fetching declaration type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new declaration type
  create: async (data: CreateDeclarationTypeDto): Promise<DeclarationType> => {
    try {
      console.log('Creating declaration type with data:', data);
      
      // Extract months from the data to handle them separately
      const { months, ...declarationTypeData } = data;
      
      // First create the declaration type without months
      const createdType = await apiClient.post<DeclarationType>('admin/declaration-types', declarationTypeData);
      
      console.log('Created declaration type:', createdType);
      
      // If months are provided, add them to the declaration type
      if (months && months.length > 0) {
        console.log('Adding months to declaration type:', months);
        
        // Add months to the declaration type
        await apiClient.post<DeclarationType>(`admin/declaration-types/${createdType.id}/months`, {
          months
        });
        
        // Get the updated declaration type with months
        const updatedType = await apiClient.get<DeclarationType>(`admin/declaration-types/${createdType.id}`);
        return updatedType;
      }
      
      return createdType;
    } catch (error) {
      console.error('Error creating declaration type:', error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  },
  
  // Update a declaration type
  update: async (id: string, data: UpdateDeclarationTypeDto): Promise<DeclarationType> => {
    try {
      return await apiClient.patch<DeclarationType, UpdateDeclarationTypeDto>(`admin/declaration-types/${id}`, data);
    } catch (error) {
      console.error(`Error updating declaration type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a declaration type
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`admin/declaration-types/${id}`);
    } catch (error) {
      console.error(`Error deleting declaration type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Add months to a declaration type
  addMonths: async (id: string, months: number[]): Promise<DeclarationType> => {
    try {
      return await apiClient.post<DeclarationType, { months: number[] }>(
        `admin/declaration-types/${id}/months`,
        { months }
      );
    } catch (error) {
      console.error(`Error adding months to declaration type with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Remove months from a declaration type
  removeMonths: async (id: string, months: number[]): Promise<DeclarationType> => {
    try {
      return await apiClient.delete<DeclarationType>(
        `admin/declaration-types/${id}/months`,
        { data: { months } }
      );
    } catch (error) {
      console.error(`Error removing months from declaration type with ID ${id}:`, error);
      throw error;
    }
  },
};
