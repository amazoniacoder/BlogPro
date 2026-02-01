import { httpClient } from '../cache/http-client';
import type { 
  FooterConfig, 
  FooterConfigResponse, 
  FooterConfigsResponse, 
  FooterHistoryResponse 
} from '../../../../shared/types/footer';

class FooterApiService {
  private baseUrl = '/api/footer';

  async getActiveConfig(): Promise<FooterConfig | null> {
    try {
      const response = await httpClient.get<FooterConfigResponse>(`${this.baseUrl}/config`);
      return response.data || null;
    } catch (error) {
      console.error('Error getting active footer config:', error);
      return null;
    }
  }

  async getAllConfigs(): Promise<FooterConfig[]> {
    try {
      const response = await httpClient.get<FooterConfigsResponse>(`${this.baseUrl}/configs`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error getting footer configs:', error);
      throw new Error('Failed to load footer configurations');
    }
  }

  async createConfig(config: Omit<FooterConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FooterConfig> {
    try {
      const response = await httpClient.post<FooterConfigResponse>(`${this.baseUrl}/config`, config);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      await this.invalidateCache();
      return response.data;
    } catch (error) {
      console.error('Error creating footer config:', error);
      throw new Error('Failed to create footer configuration');
    }
  }

  async updateConfig(id: number, updates: Partial<FooterConfig>): Promise<FooterConfig> {
    try {
      const response = await httpClient.put<FooterConfigResponse>(`${this.baseUrl}/config/${id}`, updates);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      await this.invalidateCache();
      return response.data;
    } catch (error) {
      console.error('Error updating footer config:', error);
      throw new Error('Failed to update footer configuration');
    }
  }

  async deleteConfig(id: number): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/config/${id}`);
      await this.invalidateCache();
    } catch (error) {
      console.error('Error deleting footer config:', error);
      throw new Error('Failed to delete footer configuration');
    }
  }

  async activateConfig(id: number): Promise<FooterConfig> {
    try {
      const response = await httpClient.post<FooterConfigResponse>(`${this.baseUrl}/activate/${id}`);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      await this.invalidateCache();
      return response.data;
    } catch (error) {
      console.error('Error activating footer config:', error);
      throw new Error('Failed to activate footer configuration');
    }
  }

  async getHistory(configId: number) {
    try {
      const response = await httpClient.get<FooterHistoryResponse>(`${this.baseUrl}/history/${configId}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error getting footer history:', error);
      throw new Error('Failed to load footer configuration history');
    }
  }

  async previewConfig(config: FooterConfig): Promise<FooterConfig> {
    try {
      const response = await httpClient.post<FooterConfigResponse>(`${this.baseUrl}/preview`, config);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error validating preview config:', error);
      throw new Error('Failed to validate footer configuration');
    }
  }

  private async invalidateCache(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cache = await caches.open('api-cache');
        const keys = await cache.keys();
        
        for (const request of keys) {
          if (request.url.includes('/api/footer')) {
            await cache.delete(request);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to invalidate cache:', error);
    }
  }
}

export const footerApi = new FooterApiService();