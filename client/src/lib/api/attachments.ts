import { apiClient } from './api-client';

export interface Attachment {
  id: string;
  declarationId?: string;
  livreId?: string;
  fileName: string;
  fileUrl: string;
  fileType: 'PDF' | 'AUDIO' | 'IMAGE' | 'OTHER';
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadAttachmentParams {
  file: File;
  description?: string;
  declarationId?: string;
  livreId?: string;
}

export const attachmentsApi = {
  // Upload a new attachment
  async uploadAttachment(params: UploadAttachmentParams): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', params.file);
    
    if (params.description) {
      formData.append('description', params.description);
    }
    
    if (params.declarationId) {
      formData.append('declarationId', params.declarationId);
    }
    
    if (params.livreId) {
      formData.append('livreId', params.livreId);
    }
    
    return apiClient.request<Attachment>({
      method: 'post',
      url: '/attachments/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get attachment by ID
  async getAttachment(id: string): Promise<Attachment> {
    return apiClient.get<Attachment>(`/attachments/${id}`);
  },

  // Get all attachments for a declaration
  async getDeclarationAttachments(declarationId: string): Promise<Attachment[]> {
    return apiClient.get<Attachment[]>(`/attachments/declaration/${declarationId}`);
  },

  // Get all attachments for a livre
  async getLivreAttachments(livreId: string): Promise<Attachment[]> {
    return apiClient.get<Attachment[]>(`/attachments/livre/${livreId}`);
  },

  // Delete an attachment
  async deleteAttachment(id: string): Promise<void> {
    await apiClient.delete<void>(`/attachments/${id}`);
  },

  // Get download URL for an attachment
  getDownloadUrl(id: string): string {
    // For development/testing, return a mock URL that will work with our preview components
    // In production, this would use the configured API URL
    return `${window.location.origin}/api/attachments/${id}/download`;
  },
};
