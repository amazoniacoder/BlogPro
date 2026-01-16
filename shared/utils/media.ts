/**
 * Media utility functions for file categorization and path management
 */

export type MediaCategory = 'images' | 'documents' | 'videos' | 'audio';
export type MediaSource = 'general' | 'editor';

/**
 * Determine file category based on MIME type
 */
export const getFileCategory = (mimeType: string): MediaCategory => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'documents';
};

/**
 * Get upload path based on file type and source
 */
export const getUploadPath = (fileType: string, source: MediaSource = 'general'): string => {
  const baseDir = 'uploads';
  
  if (source === 'editor') {
    return `${baseDir}/editor/images`;
  }
  
  const category = getFileCategory(fileType);
  return `${baseDir}/${category}`;
};

/**
 * Get full file URL from folder path and filename
 */
export const getFileUrl = (folderPath: string, filename: string): string => {
  return `/${folderPath}/${filename}`;
};

/**
 * Check if file type is supported
 */
export const isSupportedFileType = (mimeType: string): boolean => {
  const supportedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv'
  ];
  
  return supportedTypes.includes(mimeType);
};