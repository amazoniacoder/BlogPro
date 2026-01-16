import fs from 'fs';
import path from 'path';

/**
 * Clean up orphaned files in editor directory
 * Removes original files and extra thumbnails, keeping only the 300x300 WebP files
 */
export async function cleanupEditorDirectory(): Promise<{ cleaned: string[], errors: string[] }> {
  const editorDir = path.join(process.cwd(), "public/uploads/editor/images");
  const cleaned: string[] = [];
  const errors: string[] = [];

  if (!fs.existsSync(editorDir)) {
    return { cleaned, errors: ['Editor directory does not exist'] };
  }

  try {
    const files = fs.readdirSync(editorDir);
    
    for (const file of files) {
      const filePath = path.join(editorDir, file);
      
      // Skip if not a file
      if (!fs.statSync(filePath).isFile()) continue;
      
      const ext = path.extname(file).toLowerCase();
      
      // Remove original image files (non-WebP)
      if (['.jpg', '.jpeg', '.png', '.gif', '.jfif', '.bmp', '.tiff'].includes(ext)) {
        try {
          await fs.promises.unlink(filePath);
          cleaned.push(file);
          console.log(`Cleaned up original file: ${file}`);
        } catch (error) {
          errors.push(`Failed to delete ${file}: ${error}`);
        }
        continue;
      }
      
      // Remove thumbnail files (keep only main WebP files)
      if (file.endsWith('_thumb.webp')) {
        try {
          await fs.promises.unlink(filePath);
          cleaned.push(file);
          console.log(`Cleaned up thumbnail file: ${file}`);
        } catch (error) {
          errors.push(`Failed to delete ${file}: ${error}`);
        }
        continue;
      }
    }
    
    console.log(`Editor cleanup completed: ${cleaned.length} files cleaned, ${errors.length} errors`);
    return { cleaned, errors };
    
  } catch (error) {
    const errorMsg = `Error during editor cleanup: ${error}`;
    errors.push(errorMsg);
    console.error(errorMsg);
    return { cleaned, errors };
  }
}

/**
 * API endpoint to manually trigger editor cleanup
 */
export async function handleEditorCleanupRequest(): Promise<{ message: string; cleaned: string[]; errors: string[] }> {
  const result = await cleanupEditorDirectory();
  
  return {
    message: `Editor cleanup completed: ${result.cleaned.length} files cleaned, ${result.errors.length} errors`,
    cleaned: result.cleaned,
    errors: result.errors
  };
}