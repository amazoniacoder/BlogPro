// client/src/services/api/documentation.ts
import { httpClient } from '../cache/http-client';
import type { 
  Documentation, 
  DocumentationCategory, 
  CreateDocumentationRequest, 
  UpdateDocumentationRequest,
  CreateCategoryRequest,
  DocumentationSection,
  DocumentationContent,
  DocumentationMenu,
  DocumentationFile,
  DocumentationConversion,
  DocumentationContentVersion,
  DocumentationContentLock,
  CreateDocumentationSectionRequest,
  UpdateDocumentationSectionRequest,
  CreateDocumentationContentRequest,
  UpdateDocumentationContentRequest,
  CreateDocumentationMenuRequest,
  UpdateDocumentationMenuRequest,
  DocumentationSearchRequest,
  DocumentationSearchResult
} from '../../../../shared/types/documentation';

export const documentationApi = {
  // Public API - no authentication required
  async getPublicDocumentation(): Promise<Documentation[]> {
    console.log('Making request to /api/documentation/public');
    const response = await httpClient.get('/api/documentation/public');
    console.log('Response from /api/documentation/public:', response);
    return response;
  },

  async getPublicDocumentationBySlug(slug: string): Promise<Documentation> {
    console.log(`Making request to /api/documentation/public/${slug}`);
    const response = await httpClient.get(`/api/documentation/public/${slug}`);
    console.log(`Response from /api/documentation/public/${slug}:`, response);
    return response;
  },

  async getCategories(): Promise<DocumentationCategory[]> {
    console.log('Making request to /api/documentation/categories');
    const response = await httpClient.get('/api/documentation/categories', { bypassCache: true });
    console.log('Response from /api/documentation/categories:', response);
    return response;
  },

  async getCategoryTree(): Promise<DocumentationCategory[]> {
    const response = await httpClient.get('/api/documentation/categories/tree', { bypassCache: true });
    return response;
  },

  // Admin API - requires authentication
  async getAllDocumentation(): Promise<Documentation[]> {
    console.log('Making request to /api/documentation');
    const response = await httpClient.get('/api/documentation', { bypassCache: true });
    console.log('Response from /api/documentation:', response);
    return response;
  },

  async getDocumentationBySlug(slug: string): Promise<Documentation> {
    console.log(`Making request to /api/documentation/${slug}`);
    const response = await httpClient.get(`/api/documentation/${slug}`);
    console.log(`Response from /api/documentation/${slug}:`, response);
    return response;
  },

  async createDocumentation(data: CreateDocumentationRequest): Promise<Documentation> {
    const response = await httpClient.post('/api/documentation', data);
    return response.data;
  },

  async updateDocumentation(id: number, data: UpdateDocumentationRequest): Promise<Documentation> {
    const response = await httpClient.put(`/api/documentation/${id}`, data);
    return response.data;
  },

  async deleteDocumentation(id: number): Promise<void> {
    console.log(`Making DELETE request to /api/documentation/${id}`);
    try {
      await httpClient.delete(`/api/documentation/${id}`);
      console.log(`Successfully deleted documentation ${id}`);
    } catch (error: any) {
      console.error(`Failed to delete documentation ${id}:`, error);
      if (error.message?.includes('404')) {
        throw new Error(`Document with ID ${id} not found. It may have already been deleted.`);
      }
      throw error;
    }
  },

  async createCategory(data: CreateCategoryRequest): Promise<DocumentationCategory> {
    const response = await httpClient.post('/api/documentation/categories', data);
    return response.data;
  },

  // Menu integration operations
  async syncAllToMenu(): Promise<void> {
    await httpClient.post('/api/documentation/sync-menu');
  },

  async cleanupMenu(): Promise<void> {
    await httpClient.post('/api/documentation/cleanup-menu');
  },

  // Category management with menu integration
  async updateCategory(id: number, data: Partial<DocumentationCategory>): Promise<DocumentationCategory> {
    const response = await httpClient.put(`/api/documentation/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await httpClient.delete(`/api/documentation/categories/${id}`);
  },

  // New Documentation System API
  // Sections
  async getSections(): Promise<DocumentationSection[]> {
    const response = await httpClient.get('/api/documentation/sections', { bypassCache: true });
    return response;
  },

  async getSection(id: number): Promise<DocumentationSection> {
    const response = await httpClient.get(`/api/documentation/sections/${id}`);
    return response;
  },

  async createSection(data: CreateDocumentationSectionRequest): Promise<DocumentationSection> {
    const response = await httpClient.post('/api/documentation/sections', data);
    return response.data;
  },

  async updateSection(id: number, data: UpdateDocumentationSectionRequest): Promise<DocumentationSection> {
    const response = await httpClient.put(`/api/documentation/sections/${id}`, data);
    return response.data;
  },

  async deleteSection(id: number): Promise<void> {
    await httpClient.delete(`/api/documentation/sections/${id}`);
  },

  // Content
  async getContent(): Promise<DocumentationContent[]> {
    const response = await httpClient.get('/api/documentation/content', { bypassCache: true });
    return response;
  },

  async getContentById(id: number): Promise<DocumentationContent> {
    const response = await httpClient.get(`/api/documentation/content/${id}`);
    return response;
  },

  async getContentBySlug(slug: string): Promise<DocumentationContent> {
    const response = await httpClient.get(`/api/documentation/content/slug/${slug}`);
    return response;
  },

  async createContent(data: CreateDocumentationContentRequest): Promise<DocumentationContent> {
    const response = await httpClient.post('/api/documentation/content', data);
    return response.data;
  },

  async updateContent(id: number, data: UpdateDocumentationContentRequest): Promise<DocumentationContent> {
    const response = await httpClient.put(`/api/documentation/content/${id}`, data);
    return response.data;
  },

  async deleteContent(id: number): Promise<void> {
    await httpClient.delete(`/api/documentation/content/${id}`);
  },

  // Menu
  async getMenu(): Promise<DocumentationMenu[]> {
    const response = await httpClient.get('/api/documentation/menu');
    return response;
  },

  async createMenuItem(data: CreateDocumentationMenuRequest): Promise<DocumentationMenu> {
    const response = await httpClient.post('/api/documentation/menu', data);
    return response.data;
  },

  async updateMenuItem(id: number, data: UpdateDocumentationMenuRequest): Promise<DocumentationMenu> {
    const response = await httpClient.put(`/api/documentation/menu/${id}`, data);
    return response.data;
  },

  async deleteMenuItem(id: number): Promise<void> {
    await httpClient.delete(`/api/documentation/menu/${id}`);
  },

  // Search
  async searchDocumentation(params: DocumentationSearchRequest): Promise<DocumentationSearchResult[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const url = `/api/documentation/search?${queryString}`;
    const response = await httpClient.get(url);
    return response;
  },

  // Files
  async getFiles(contentId?: number): Promise<DocumentationFile[]> {
    const url = contentId ? `/api/documentation/files?contentId=${contentId}` : '/api/documentation/files';
    const response = await httpClient.get(url);
    return response;
  },

  async uploadFile(contentId: number, file: File): Promise<DocumentationFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentId', contentId.toString());
    
    const response = await httpClient.post('/api/documentation/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteFile(id: number): Promise<void> {
    await httpClient.delete(`/api/documentation/files/${id}`);
  },

  // Conversions
  async convertContent(sourceFormat: string, targetFormat: string, content: string): Promise<DocumentationConversion> {
    const response = await httpClient.post('/api/documentation/conversions', {
      sourceFormat,
      targetFormat,
      sourceContent: content
    });
    return response.data;
  },

  // Versions
  async getVersions(contentId: number): Promise<DocumentationContentVersion[]> {
    const response = await httpClient.get(`/api/documentation/content/${contentId}/versions`);
    return response;
  },

  async createVersion(contentId: number, changeLog?: string): Promise<DocumentationContentVersion> {
    const response = await httpClient.post(`/api/documentation/content/${contentId}/versions`, { changeLog });
    return response.data;
  },

  async restoreVersion(contentId: number, versionId: number): Promise<DocumentationContent> {
    const response = await httpClient.post(`/api/documentation/content/${contentId}/versions/${versionId}/restore`);
    return response.data;
  },

  // Locks
  async lockContent(contentId: number): Promise<DocumentationContentLock> {
    const response = await httpClient.post(`/api/documentation/content/${contentId}/lock`);
    return response.data;
  },

  async unlockContent(contentId: number): Promise<void> {
    await httpClient.delete(`/api/documentation/content/${contentId}/lock`);
  },

  async getContentLock(contentId: number): Promise<DocumentationContentLock | null> {
    try {
      const response = await httpClient.get(`/api/documentation/content/${contentId}/lock`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};
