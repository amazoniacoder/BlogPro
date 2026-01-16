// client/src/services/api/settings.ts
import { httpClient } from '../cache/http-client';
import { cacheService } from '../cache';

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  metaTags: {
    keywords: string;
    description: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
}

export const settingsService = {
  // Get site settings
  getSettings: async (): Promise<SiteSettings> => {
    try {
      return await httpClient.get<SiteSettings>('/api/settings');
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings instead of throwing
      return {
        siteTitle: 'WebDesignStudio',
        siteDescription: 'Professional web design and development services',
        contactEmail: 'contact@webdesignstudio.com',
        socialMedia: {},
        metaTags: {
          keywords: '',
          description: '',
        },
        analytics: {},
      };
    }
  },
  
  // Update site settings
  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    try {
      const updatedSettings = await httpClient.put<SiteSettings>('/api/settings', settings);
      
      // Invalidate settings cache
      cacheService.invalidate('/api/settings');
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
  
  // Force refresh settings
  refreshSettings: async (): Promise<SiteSettings> => {
    // Invalidate settings cache
    cacheService.invalidate('/api/settings');
    
    // Fetch fresh data
    return settingsService.getSettings();
  }
};
