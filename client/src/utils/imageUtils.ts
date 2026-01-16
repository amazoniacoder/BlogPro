/**
 * Utility functions for handling images
 */

/**
 * Fix image paths to ensure they work correctly in the application
 * @param path The original image path
 * @returns The fixed image path
 */
export function fixImagePath(path: string): string {
  if (!path) return '/images/placeholder-image.png';
  
  // If it's already a data URL or absolute URL, return as is
  if (path.startsWith('data:') || path.startsWith('http')) {
    return path;
  }
  
  // Fix relative paths
  if (path.includes('/uploads/thumbnails/')) {
    // Use the filename only and correct path
    const filename = path.split('/').pop();
    if (!filename) return '/images/placeholder-image.png';
    return `/uploads/thumbnails/${filename}`;
  } else if (path.includes('/uploads/')) {
    // Use the filename only and correct path
    const filename = path.split('/').pop();
    if (!filename) return '/images/placeholder-image.png';
    return `/uploads/${filename}`;
  }
  
  // Check for common issues with paths
  if (path.startsWith('/public/')) {
    // Remove incorrect /public prefix
    return path.replace('/public', '');
  }
  
  // If it doesn't match any pattern, return as is
  return path;
}

/**
 * Get a valid thumbnail URL for a blog post or other content
 * @param thumbnailUrl The thumbnail URL
 * @param imageUrl The main image URL (fallback)
 * @returns A valid image URL
 */
export function getValidThumbnail(thumbnailUrl?: string, imageUrl?: string): string {
  // If thumbnail exists and seems valid, use it
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return fixImagePath(thumbnailUrl);
  }
  
  // If thumbnail doesn't exist but main image does, use main image
  if (imageUrl && imageUrl.trim() !== '') {
    return fixImagePath(imageUrl);
  }
  
  // If neither exists, use placeholder
  return '/images/placeholder-image.png';
}

/**
 * Create an image error handler that tries fallbacks
 * @param thumbnailUrl The thumbnail URL
 * @param imageUrl The main image URL (first fallback)
 * @returns An onError handler function
 */
export function createImageErrorHandler(thumbnailUrl?: string, imageUrl?: string) {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const currentSrc = e.currentTarget.src;
    const thumbnailFilename = thumbnailUrl?.split('/').pop();
    
    // If we're currently showing the thumbnail and main image exists, try main image
    if (thumbnailUrl && imageUrl && thumbnailFilename && currentSrc.includes(thumbnailFilename)) {
      console.log(`Thumbnail failed, trying main image`);
      e.currentTarget.src = fixImagePath(imageUrl);
    }
    // If we're already using the main image or it also fails, use placeholder
    else if (currentSrc !== '/images/placeholder-image.png') {
      console.log(`Image failed, using placeholder`);
      e.currentTarget.src = '/images/placeholder-image.png';
    }
  };
}
