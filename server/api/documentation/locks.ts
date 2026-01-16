/**
 * Documentation Content Locks API
 * Endpoints for real-time content locking
 * Prevents editing conflicts during collaboration
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';
import { pool } from '../../db/db';

const router = Router();

/**
 * Check if content is locked
 * GET /api/documentation/content/:id/lock
 */
router.get('/content/:id/lock', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM is_content_locked($1)`,
      [id]
    );

    const lockInfo = result.rows[0];
    
    res.json({
      success: true,
      isLocked: lockInfo.is_locked,
      lock: lockInfo.is_locked ? {
        userId: lockInfo.locked_by,
        userName: lockInfo.locked_by_name,
        expiresAt: lockInfo.expires_at
      } : null
    });
  } catch (error) {
    console.error('Error checking content lock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check content lock'
    });
  }
});

/**
 * Lock content for editing
 * POST /api/documentation/content/:id/lock
 */
router.post('/content/:id/lock', 
  requireAuth, 
  requireRole(['admin', 'editor']), 
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.username || (req as any).user?.userId;
      const userName = (req as any).user?.username || 'Unknown User';

      // Check if already locked
      const lockCheck = await pool.query(
        'SELECT * FROM is_content_locked($1)',
        [id]
      );

      const existingLock = lockCheck.rows[0];
      
      if (existingLock.is_locked && existingLock.locked_by !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Content is already locked by another user',
          lock: {
            userId: existingLock.locked_by,
            userName: existingLock.locked_by_name,
            expiresAt: existingLock.expires_at
          }
        });
      }

      // Create or update lock
      await pool.query(
        `INSERT INTO documentation_content_locks (content_id, user_id, user_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (content_id) 
         DO UPDATE SET 
           user_id = $2, 
           user_name = $3, 
           locked_at = NOW(), 
           expires_at = NOW() + INTERVAL '30 minutes'`,
        [id, userId, userName]
      );

      res.json({
        success: true,
        message: 'Content locked successfully',
        lock: {
          userId,
          userName,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('Error locking content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to lock content'
      });
    }
  }
);

/**
 * Unlock content
 * DELETE /api/documentation/content/:id/lock
 */
router.delete('/content/:id/lock', 
  requireAuth, 
  requireRole(['admin', 'editor']), 
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.username || (req as any).user?.userId;

      // Check if user owns the lock or is admin
      const lockCheck = await pool.query(
        'SELECT * FROM is_content_locked($1)',
        [id]
      );

      const existingLock = lockCheck.rows[0];
      
      if (!existingLock.is_locked) {
        return res.json({
          success: true,
          message: 'Content was not locked'
        });
      }

      if (existingLock.locked_by !== userId && (req as any).user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only unlock content you have locked'
        });
      }

      // Remove lock
      await pool.query(
        'DELETE FROM documentation_content_locks WHERE content_id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Content unlocked successfully'
      });
    } catch (error) {
      console.error('Error unlocking content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unlock content'
      });
    }
  }
);

/**
 * Clean up expired locks
 * POST /api/documentation/locks/cleanup
 */
router.post('/locks/cleanup', requireAuth, async (_: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM documentation_content_locks WHERE expires_at < NOW()'
    );

    res.json({
      success: true,
      message: `Cleaned up ${result.rowCount} expired locks`
    });
  } catch (error) {
    console.error('Error cleaning up locks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup expired locks'
    });
  }
});

export default router;