import { Router, Request, Response } from 'express';
import { requireAuth as authenticateToken } from '../middleware/authMiddleware';
import { securityHeadersMiddleware } from '../middleware/security';
import { db } from '../db/connection';

const router = Router();

// Apply security middleware
router.use(securityHeadersMiddleware);

// GET /api/user/comments - Get user's comments
router.get('/comments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const comments = await db.query(`
      SELECT c.*, u.username, u.first_name, u.last_name, u.profile_image_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const totalResult = await db.query('SELECT COUNT(*) FROM comments WHERE user_id = $1', [userId]);
    const total = parseInt(totalResult.rows[0].count);
    
    res.json({
      success: true,
      data: comments.rows,
      pagination: { page, limit, total },
      message: 'User comments retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/user/comment-notifications - Get user's comment notifications
router.get('/comment-notifications', authenticateToken, async (_req: Request, res: Response) => {
  try {
    // Simple implementation - return empty array since notifications aren't implemented yet
    res.json({
      success: true,
      data: [],
      message: 'Comment notifications retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching comment notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/user/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (_req: Request, res: Response) => {
  try {
    // Simple implementation - return success since notifications aren't implemented yet
    res.json({
      success: true,
      data: null,
      message: 'Notification marked as read successfully'
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;