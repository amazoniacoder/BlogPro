import fs from 'fs';
import path from 'path';
import { db } from '../../db/db';
import { mediaFiles } from '../../../shared/types/schema';
import { eq } from 'drizzle-orm';

/**
 * Utility to check and fix media file references in the database
 */
export async function checkAndFixMediaFiles() {
  try {
    console.log('Checking media files...');
    
    // Get all media files from database
    const allFiles = await db.select().from(mediaFiles as any);
    
    for (const file of allFiles) {
      // Check main file
      const filePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''));
      const fileExists = fs.existsSync(filePath);
      
      // Check thumbnail
      const thumbnailPath = file.thumbnailUrl ? 
        path.join(process.cwd(), 'public', file.thumbnailUrl.replace(/^\//, '')) : null;
      const thumbnailExists = thumbnailPath ? fs.existsSync(thumbnailPath) : false;
      
      console.log(`File ${file.filename}: main=${fileExists}, thumbnail=${thumbnailExists}`);
      
      // If thumbnail doesn't exist but is referenced in DB, update the record
      if (!thumbnailExists && file.thumbnailUrl) {
        console.log(`Fixing missing thumbnail for ${file.filename}`);
        await db.update(mediaFiles as any)
          .set({ thumbnailUrl: file.url }) // Use main URL as thumbnail
          .where(eq(mediaFiles.id as any, file.id));
      }
      
      // If main file doesn't exist, could delete the record or mark it
      if (!fileExists) {
        console.log(`Warning: Main file missing for ${file.filename}`);
        // Uncomment to delete records with missing files
        // await db.delete(mediaFiles).where(mediaFiles.id.equals(file.id));
      }
    }
    
    console.log('Media file check completed');
  } catch (error) {
    console.error('Error checking media files:', error);
  }
}