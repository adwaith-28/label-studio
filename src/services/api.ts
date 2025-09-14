import { 
  Template, 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  LabelRequest, 
  PreviewLabelRequest,
  ApiResponse,
  PaginatedResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Template API methods
  async getTemplates(page = 1, limit = 20, category?: string): Promise<ApiResponse<PaginatedResponse<Template>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && category !== 'All' && { category }),
    });

    return this.request<PaginatedResponse<Template>>(`/templates?${params}`);
  }

  async getTemplate(id: number): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`);
  }

  async createTemplate(template: CreateTemplateRequest): Promise<ApiResponse<Template>> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: number, updates: Partial<UpdateTemplateRequest>): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTemplate(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTemplate(id: number): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Label generation methods
  async generateLabel(request: LabelRequest): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/labels/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Label generation failed:', error);
      return null;
    }
  }

  async previewLabel(request: PreviewLabelRequest): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/labels/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Label preview failed:', error);
      return null;
    }
  }

  // File upload methods
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Image upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }
}

export const apiService = new ApiService();