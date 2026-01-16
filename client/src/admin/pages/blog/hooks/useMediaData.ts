// client/src/admin/pages/blog/hooks/useMediaData.ts
import { useCallback } from "react";
import { mediaService } from "@/services/api/media";


export const useMediaData = () => {
  const fetchMedia = useCallback(async () => {
    try {
      const media = await mediaService.getMediaFiles();
        
      // Convert the API response to match our MediaItem type
      const formattedMedia = media.map((item) => ({
        ...item,
        id: String(item.id),
        createdAt: typeof item.createdAt === 'string' 
          ? item.createdAt 
          : item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: typeof item.createdAt === 'string'
          ? item.createdAt
          : item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        // Add optional properties with default values
        width: undefined,
        height: undefined,
        alt: item.originalName || undefined,
        title: item.originalName || undefined,
      }));
      
      return { data: formattedMedia };
    } catch (error) {
      console.error("Failed to fetch media files:", error);
      throw error;
    }
  }, []);

  return {
    fetchMedia
  };
};
