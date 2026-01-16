import { Request, Response, NextFunction } from 'express';
import { db } from '../db/db';
import { users } from '../../shared/types/schema';
import { eq } from 'drizzle-orm';

// Track last update time per user to avoid excessive DB calls
const lastUpdateTimes = new Map<string, number>();

/**
 * Middleware to track user activity (throttled to avoid rate limiting)
 */
export const activityTracker = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Only track activity for authenticated users
    const user = (req.session as any)?.user;
    if (user && user.id) {
      const now = Date.now();
      const lastUpdate = lastUpdateTimes.get(user.id) || 0;
      
      // Only update if more than 2 minutes have passed since last update
      if (now - lastUpdate > 2 * 60 * 1000) {
        lastUpdateTimes.set(user.id, now);
        
        // Update user's last activity timestamp (non-blocking)
        db.update(users as any)
          .set({ updatedAt: new Date() })
          .where(eq(users.id as any, user.id))
          .catch(() => {
            // Silently fail if update doesn't work
          });
      }
    }
  } catch (error) {
    // Don't block the request if activity tracking fails
  }
  
  next();
};