import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Windows-compatible file deletion with multiple fallback methods
 */
async function deleteFileWindows(filePath: string): Promise<boolean> {
  // Method 1: Try fs.promises.unlink with delay
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    await fs.promises.unlink(filePath);
    return true;
  } catch (error1) {
    // Method 2: Try with longer delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fs.promises.unlink(filePath);
      return true;
    } catch (error2) {
      // Method 3: Use Windows del command as last resort
      try {
        await execAsync(`del /f /q "${filePath}"`);
        return true;
      } catch (error3) {
        console.error(`All deletion methods failed for ${filePath}:`, error3);
        return false;
      }
    }
  }
}

/**
 * Utility function to clean up original image files that have WebP equivalents
 * This runs automatically to ensure original files are deleted after WebP conversion
 */
export async function cleanupOriginalFiles(): Promise<{ deleted: string[], errors: string[] }> {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.jfif'];
  const deletedFiles: string[] = [];
  const errors: string[] = [];

  if (!fs.existsSync(uploadsDir)) {
    return { deleted: deletedFiles, errors: ['Uploads directory not found'] };
  }

  try {
    const files = fs.readdirSync(uploadsDir);
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      
      // Skip if file doesn't exist or is directory
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        continue;
      }
      
      const fileExt = path.extname(file).toLowerCase();
      
      // Skip if not an image file or already WebP
      if (!imageExtensions.includes(fileExt)) {
        continue;
      }
      
      // Check if corresponding WebP exists
      const filenameWithoutExt = path.parse(file).name;
      const webpFile = `${filenameWithoutExt}.webp`;
      const webpPath = path.join(uploadsDir, webpFile);
      
      if (fs.existsSync(webpPath)) {
        // WebP exists, safe to delete original
        const success = await deleteFileWindows(filePath);
        if (success) {
          deletedFiles.push(file);
          console.log(`Cleanup: Deleted original file: ${file} (WebP equivalent exists)`);
        } else {
          const errorMsg = `Failed to delete ${file}: Windows file lock`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    }
    
    console.log(`Cleanup completed: ${deletedFiles.length} files deleted, ${errors.length} errors`);
    return { deleted: deletedFiles, errors };
    
  } catch (error) {
    const errorMsg = `Error during cleanup: ${error}`;
    errors.push(errorMsg);
    console.error(errorMsg);
    return { deleted: deletedFiles, errors };
  }
}

/**
 * Force cleanup of a specific original file if its WebP equivalent exists
 */
export async function cleanupSpecificFile(originalFilename: string): Promise<boolean> {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  const originalPath = path.join(uploadsDir, originalFilename);
  
  if (!fs.existsSync(originalPath)) {
    return true; // Already deleted
  }
  
  // Check if WebP equivalent exists
  const filenameWithoutExt = path.parse(originalFilename).name;
  const webpFile = `${filenameWithoutExt}.webp`;
  const webpPath = path.join(uploadsDir, webpFile);
  
  if (fs.existsSync(webpPath)) {
    const success = await deleteFileWindows(originalPath);
    if (success) {
      console.log(`Force cleanup: Deleted original file: ${originalFilename}`);
    } else {
      console.error(`Force cleanup failed for ${originalFilename}: Windows file lock`);
    }
    return success;
  }
  
  return false; // WebP doesn't exist, keep original
}

/**
 * Force cleanup of a specific original file in a specific directory if its WebP equivalent exists
 */
export async function cleanupSpecificFileInDirectory(
  originalFilename: string, 
  directory: string
): Promise<boolean> {
  const originalPath = path.join(process.cwd(), "public", directory, originalFilename);
  
  if (!fs.existsSync(originalPath)) {
    return true; // Already deleted
  }
  
  // Check if WebP equivalent exists in same directory
  const filenameWithoutExt = path.parse(originalFilename).name;
  const webpFile = `${filenameWithoutExt}.webp`;
  const webpPath = path.join(process.cwd(), "public", directory, webpFile);
  
  if (fs.existsSync(webpPath)) {
    const success = await deleteFileWindows(originalPath);
    if (success) {
      console.log(`Directory cleanup: Deleted original file: ${originalFilename} from ${directory}`);
    } else {
      console.error(`Directory cleanup failed for ${originalFilename} in ${directory}: Windows file lock`);
    }
    return success;
  }
  
  return false; // WebP doesn't exist, keep original
}