// client/src/services/api/media.ts
import { mediaFiles } from "@/../../shared/types/schema";

// Define MediaFile type based on the schema
type MediaFile = typeof mediaFiles.$inferSelect;
import { httpClient } from '../cache/http-client';
import { cacheService } from '../cache';

// Media API for handling image uploads
export const mediaService = {
  // Get all media files
  getMediaFiles: async (): Promise<MediaFile[]> => {
    try {
      const data = await httpClient.get<MediaFile[]>('/api/media', {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // Add absolute URLs to ensure proper loading
      return data.map((file: MediaFile) => ({
        ...file,
        url: ensureAbsoluteUrl(file.url),
        thumbnailUrl: file.thumbnailUrl ? ensureAbsoluteUrl(file.thumbnailUrl) : null
      }));
    } catch (error) {
      console.error("Failed to fetch media files:", error);
      throw error;
    }
  },
  
  // Get fresh media files bypassing cache
  refreshMediaFiles: async (): Promise<MediaFile[]> => {
    try {
      // Invalidate cache first
      cacheService.invalidateByPattern('/api/media');
      
      const data = await httpClient.get<MediaFile[]>('/api/media?noCache=true', {
        credentials: "include",
        bypassCache: true
      });
      
      // Add absolute URLs to ensure proper loading
      return data.map((file: MediaFile) => ({
        ...file,
        url: ensureAbsoluteUrl(file.url),
        thumbnailUrl: file.thumbnailUrl ? ensureAbsoluteUrl(file.thumbnailUrl) : null
      }));
    } catch (error) {
      console.error("Failed to refresh media files:", error);
      throw error;
    }
  },
  
  // Get a single media file by ID
  getMediaFileById: async (id: number): Promise<MediaFile> => {
    try {
      const file = await httpClient.get<MediaFile>(`/api/media/${id}`, {
        credentials: "include",
      });
      
      return {
        ...file,
        url: ensureAbsoluteUrl(file.url),
        thumbnailUrl: file.thumbnailUrl ? ensureAbsoluteUrl(file.thumbnailUrl) : null
      };
    } catch (error) {
      console.error(`Failed to fetch media file ${id}:`, error);
      throw error;
    }
  },
  
  // Upload a new media file
  uploadMediaFile: async (file: File, source: 'general' | 'editor' = 'general'): Promise<MediaFile> => {
    console.log(`Preparing to upload file: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error("File size exceeds 10MB limit");
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("source", source);
    
    try {
      console.log("Sending upload request to server...");
      
      const result = await httpClient.post<MediaFile>("/api/media", formData, {
        credentials: "include",
        bypassCache: true // Bypass cache for uploads
      });
      
      console.log("Upload successful, server response:", result);
      
      // Simple cache invalidation
      cacheService.invalidateByPattern('/api/media');
      
      return {
        ...result,
        url: ensureAbsoluteUrl(result.url),
        thumbnailUrl: result.thumbnailUrl ? ensureAbsoluteUrl(result.thumbnailUrl) : null
      };
    } catch (error) {
      console.error("Failed to upload media file:", error);
      throw error;
    }
  },
  
  // Delete a media file
  deleteMediaFile: async (id: number): Promise<void> => {
    try {
      await httpClient.delete<void>(`/api/media/${id}`, {
        credentials: "include",
        bypassCache: true // Bypass cache for deletes
      });
      
      // Simple cache invalidation
      cacheService.invalidateByPattern('/api/media');
    } catch (error) {
      console.error(`Failed to delete media file ${id}:`, error);
      throw error;
    }
  },
  
  // Clean up all non-WebP original files
  cleanupOriginals: async (): Promise<{ message: string; deleted: string[] }> => {
    try {
      const result = await httpClient.delete<{ message: string; deleted: string[] }>('/api/media/cleanup-all-originals', {
        credentials: "include",
      });
      
      // Invalidate cache after cleanup
      cacheService.invalidateByPattern('/api/media');
      
      return result;
    } catch (error) {
      console.error('Failed to cleanup original files:', error);
      throw error;
    }
  },
  
  // Update database with correct WebP information
  updateDatabase: async (): Promise<{ message: string; updated: number }> => {
    try {
      const result = await httpClient.post<{ message: string; updated: number }>('/api/media/update-database', {}, {
        credentials: "include",
      });
      
      // Clear all cache
      cacheService.clear();
      
      return result;
    } catch (error) {
      console.error('Failed to update database:', error);
      throw error;
    }
  },
  
  // Bulk delete media files
  bulkDeleteMediaFiles: async (ids: number[]): Promise<{ deleted: number[]; failed: Array<{ id: number; error: string }> }> => {
    try {
      const response = await httpClient.delete<{ results: { deleted: number[]; failed: Array<{ id: number; error: string }> } }>('/api/media/bulk', {
        body: JSON.stringify({ ids }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        bypassCache: true
      });
      
      // Clear cache after bulk delete
      cacheService.invalidateByPattern('/api/media');
      
      return response.results;
    } catch (error) {
      console.error('Failed to bulk delete media files:', error);
      throw error;
    }
  },
  
  // Clear all media cache
  clearCache: async (): Promise<void> => {
    cacheService.clear();
  }
};

// Helper function to ensure URLs are absolute
function ensureAbsoluteUrl(url: string): string {
  if (!url) return '';
  
  // If URL is already absolute, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL is a placeholder, make sure it's absolute
  if (url === '/images/placeholder-image.png') {
    return `${window.location.origin}/images/placeholder-image.png`;
  }
  
  // Otherwise, prepend the origin
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
}
