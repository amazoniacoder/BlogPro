// client/src/admin/pages/media/hooks/useMediaData.ts
import { useReducer, useEffect, useCallback } from "react";
import { mediaReducer, initialState } from "../state/reducer";
import { mediaService } from "@/services/api/media";
import { MediaItem } from "../state/types";
import { useNotification } from "@/ui-system/components/feedback";

export const useMediaData = () => {
  const [state, dispatch] = useReducer(mediaReducer, initialState);
  const { showSuccess, showError } = useNotification();

  const fetchMedia = useCallback(async (forceRefresh = false) => {
    dispatch({ type: "FETCH_MEDIA_START" });

    try {
      // Use refreshMediaFiles if forceRefresh is true
      const media = forceRefresh 
        ? await mediaService.refreshMediaFiles()
        : await mediaService.getMediaFiles();
        
      // Convert the API response to match our MediaItem type
      const formattedMedia = media.map((item) => ({
        ...item,
        id: String(item.id),
        thumbnailUrl: item.thumbnailUrl || item.url,
        createdAt: typeof item.createdAt === 'string' 
          ? item.createdAt 
          : item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: 'updatedAt' in item && item.updatedAt
          ? typeof item.updatedAt === 'string'
            ? item.updatedAt
            : new Date(item.updatedAt as string | number | Date).toISOString()
          : item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        // Map category and source with proper defaults
        category: (item.category as 'images' | 'documents' | 'videos' | 'audio') || 
          (item.mimeType.startsWith('image/') ? 'images' : 
           item.mimeType.startsWith('video/') ? 'videos' : 
           item.mimeType.startsWith('audio/') ? 'audio' : 'documents'),
        source: (item.source as 'general' | 'editor') || 'general',
        folderPath: item.folderPath || '',
        // Add optional properties that MediaItem expects but API doesn't provide
        width: undefined,
        height: undefined,
        alt: item.filename || undefined,
        title: item.filename || undefined,
      }));
      
      dispatch({ type: "FETCH_MEDIA_SUCCESS", payload: formattedMedia });
    } catch (error) {
      dispatch({
        type: "FETCH_MEDIA_FAILURE",
        error: error instanceof Error ? error.message : "Failed to fetch media",
      });
      showError("Failed to fetch media files");
    }
  }, [showError]);

  const deleteMedia = useCallback(async (itemId: string) => {
    dispatch({ type: "DELETE_MEDIA_START", itemId });

    try {
      await mediaService.deleteMediaFile(Number(itemId));
      dispatch({ type: "DELETE_MEDIA_SUCCESS", itemId });
      showSuccess("Media file deleted successfully");
    } catch (error) {
      dispatch({
        type: "DELETE_MEDIA_FAILURE",
        error: error instanceof Error ? error.message : "Failed to delete media",
      });
      showError("Failed to delete media file");
    }
  }, [fetchMedia, showSuccess, showError]);

  const updateMedia = useCallback(async (item: MediaItem) => {
    dispatch({ type: "UPDATE_MEDIA_START", itemId: item.id });

    try {
      const updatedItem = await mediaService.getMediaFileById(Number(item.id));
      
      const formattedItem = {
        ...item,
        ...updatedItem,
        id: String(updatedItem.id),
        thumbnailUrl: updatedItem.thumbnailUrl || updatedItem.url,
        createdAt: typeof updatedItem.createdAt === 'string'
          ? updatedItem.createdAt
          : updatedItem.createdAt ? new Date(updatedItem.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: 'updatedAt' in updatedItem && updatedItem.updatedAt
          ? typeof updatedItem.updatedAt === 'string'
            ? updatedItem.updatedAt
            : new Date(updatedItem.updatedAt as string | number | Date).toISOString()
          : updatedItem.createdAt ? new Date(updatedItem.createdAt).toISOString() : new Date().toISOString(),
        // Map category and source with proper defaults
        category: (updatedItem.category as 'images' | 'documents' | 'videos' | 'audio') || 
          (updatedItem.mimeType.startsWith('image/') ? 'images' : 
           updatedItem.mimeType.startsWith('video/') ? 'videos' : 
           updatedItem.mimeType.startsWith('audio/') ? 'audio' : 'documents'),
        source: (updatedItem.source as 'general' | 'editor') || 'general',
        folderPath: updatedItem.folderPath || '',
      };
      
      dispatch({
        type: "UPDATE_MEDIA_SUCCESS",
        item: formattedItem,
      });
      
      showSuccess("Media file updated successfully");
    } catch (error) {
      dispatch({
        type: "UPDATE_MEDIA_FAILURE",
        error: error instanceof Error ? error.message : "Failed to update media",
      });
      showError("Failed to update media file");
    }
  }, [showSuccess, showError]);

  const uploadMedia = useCallback(async (files: File[], source: 'general' | 'editor' = 'general') => {
    dispatch({ type: "UPLOAD_START" });
    console.log("Starting upload of", files.length, "files");

    try {
      // Handle multiple files with Promise.all
      const uploadPromises = files.map(async (file, index) => {
        const progress = Math.round(((index + 1) / files.length) * 100);
        console.log(`Uploading file ${index + 1}/${files.length}: ${file.name}`);
        dispatch({ type: "UPLOAD_PROGRESS", progress });

        try {
          const result = await mediaService.uploadMediaFile(file, source);
          console.log(`Successfully uploaded ${file.name}:`, result);
          
          return {
            ...result,
            id: String(result.id), // Convert ID to string
            thumbnailUrl: result.thumbnailUrl || result.url,
            createdAt: typeof result.createdAt === 'string'
              ? result.createdAt
              : result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: 'updatedAt' in result && result.updatedAt
              ? typeof result.updatedAt === 'string'
                ? result.updatedAt
                : new Date(result.updatedAt as string | number | Date).toISOString()
              : result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
            // Map category and source with proper defaults
            category: (result.category as 'images' | 'documents' | 'videos' | 'audio') || 
              (result.mimeType.startsWith('image/') ? 'images' : 
               result.mimeType.startsWith('video/') ? 'videos' : 
               result.mimeType.startsWith('audio/') ? 'audio' : 'documents'),
            source: (result.source as 'general' | 'editor') || source,
            folderPath: result.folderPath || '',
            // Add required properties for MediaItem
            width: undefined,
            height: undefined,
            alt: result.filename || undefined,
            title: result.filename || undefined,
          };
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          throw fileError;
        }
      });

      const uploadedItems = await Promise.all(uploadPromises);
      console.log("All files uploaded successfully:", uploadedItems);
      
      dispatch({ type: "UPLOAD_SUCCESS", items: uploadedItems });
      showSuccess(`${files.length} file(s) uploaded successfully`);
      
      // Close the upload modal after successful upload
      dispatch({ type: "HIDE_UPLOAD_MODAL" });
    } catch (error) {
      console.error("Error in uploadMedia:", error);
      dispatch({
        type: "UPLOAD_FAILURE",
        error: error instanceof Error ? error.message : "Failed to upload media",
      });
      showError(`Failed to upload media files: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [fetchMedia, showSuccess, showError]);

  const cleanupOriginals = useCallback(async () => {
    try {
      const result = await mediaService.cleanupOriginals();
      showSuccess(`${result.message} (${result.deleted.length} files deleted)`);
      fetchMedia(true); // Refresh after cleanup
      return result;
    } catch (error) {
      showError("Failed to cleanup original files");
      throw error;
    }
  }, [fetchMedia, showSuccess, showError]);

  const updateDatabase = useCallback(async () => {
    try {
      await mediaService.clearCache(); // Clear cache first
      const result = await mediaService.updateDatabase();
      showSuccess(`${result.message}`);
      await fetchMedia(true); // Force refresh after update
      return result;
    } catch (error) {
      showError("Failed to update database");
      throw error;
    }
  }, [fetchMedia, showSuccess, showError]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return {
    state,
    dispatch,
    fetchMedia,
    deleteMedia,
    updateMedia,
    uploadMedia,
    cleanupOriginals,
    updateDatabase,
  };
};
