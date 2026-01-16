import { db } from '../../db/db';
import { mediaFiles } from '../../../shared/types/schema';
import path from 'path';
import fs from 'fs';
import { eq } from 'drizzle-orm';

/**
 * Utility to clean up missing media files from the database
 */
export async function cleanupMissingMediaFiles() {
  try {
    console.log('Starting media files cleanup...');
    
    // Get all media files from database
    const allFiles = await db.select().from(mediaFiles as any);
    let removedCount = 0;
    
    for (const file of allFiles) {
      // Check main file
      const filePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''));
      const fileExists = fs.existsSync(filePath);
      
      if (!fileExists) {
        console.log(`Removing missing file from database: ${file.filename} (ID: ${file.id})`);
        await db.delete(mediaFiles as any).where(eq(mediaFiles.id as any, file.id));
        removedCount++;
      }
    }
    
    console.log(`Media files cleanup completed. Removed ${removedCount} entries for missing files.`);
    return removedCount;
  } catch (error) {
    console.error('Error cleaning up media files:', error);
    throw error;
  }
}