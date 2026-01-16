import { db } from '../db/db';
import { mediaFiles } from '../../shared/types/schema';
import { eq } from 'drizzle-orm';
// Create types from the mediaFiles table
type MediaFile = typeof mediaFiles.$inferSelect;
type InsertMediaFile = typeof mediaFiles.$inferInsert;

export async function getMediaFiles(): Promise<MediaFile[]> {
  try {
    return await db.select().from(mediaFiles as any).orderBy(mediaFiles.createdAt as any) as MediaFile[];
  } catch (error) {
    console.error('Error fetching media files:', error);
    return [];
  }
}

export async function getMediaFilesPaginated(page: number = 1, limit: number = 10): Promise<{ data: MediaFile[], total: number, totalPages: number }> {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const allFiles = await db.select().from(mediaFiles as any) as MediaFile[];
    const total = allFiles.length;
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated data
    const data = await db.select().from(mediaFiles as any)
      .orderBy(mediaFiles.createdAt as any)
      .limit(limit)
      .offset(offset) as MediaFile[];
    
    return {
      data,
      total,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching paginated media files:', error);
    return {
      data: [],
      total: 0,
      totalPages: 1
    };
  }
}

export async function getMediaFile(id: number): Promise<MediaFile | undefined> {
  const results = await db.select().from(mediaFiles as any).where(eq(mediaFiles.id as any, id)) as MediaFile[];
  return results[0];
}

export async function createMediaFile(data: InsertMediaFile): Promise<MediaFile> {
  const result = await db.insert(mediaFiles as any).values(data).returning() as MediaFile[];
  return result[0];
}

export async function deleteMediaFile(id: number): Promise<boolean> {
  const result = await db.delete(mediaFiles as any).where(eq(mediaFiles.id as any, id)).returning() as any[];
  return result.length > 0;
}

export async function updateMediaFile(id: number, data: Partial<InsertMediaFile>): Promise<MediaFile | undefined> {
  const result = await db.update(mediaFiles as any).set(data).where(eq(mediaFiles.id as any, id)).returning() as MediaFile[];
  return result[0];
}